import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../../components/app-store'
import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { withApollo } from '../../../lib/apollo'
import Alert from 'react-bootstrap/Alert'
import RenderResponse from '../../../components/render-response'
import Loading from '../../../components/loading'
import PageTitle from '../../../components/page-title'
import Form from '../../../components/document/form'
import { Breadcrumbs, Breadcrumb } from '../../../components/breadcrumbs'
import DocumentHeader from '../../../components/document/document-header'
import mEditorApi from '../../../service/'
import withAuthentication from '../../../components/with-authentication'
import FormActions from '../../../components/document/form-actions'
import gql from 'graphql-tag'
import { urlEncode } from '../../../lib/url'
import omitBy from 'lodash.omitby'
import { v4 as uuid } from 'uuid'

const UNTITLED_DOCUMENT_TITLE = 'Untitled Document'

const MODEL_QUERY = gql`
    query getModel($modelName: String!) {
        model(modelName: $modelName) {
            name
            description
            icon {
                name
                color
            }
            schema
            layout
            titleProperty
            workflow {
                currentNode {
                    privileges {
                        role
                        privilege
                    }
                }
            }
        }
    }
`

const NewDocumentPage = ({ user }) => {
    const router = useRouter()
    const params = router.query
    const modelName = params.modelName as string

    // TODO: look for document in local storage first, populate from there, otherwise create new object
    const [localChanges, setLocalChanges] = useState({
        localId: uuid(),
        title: UNTITLED_DOCUMENT_TITLE,
        model: modelName,
        modifiedOn: Date.now(),
        modifiedBy: user.uid,
        formData: {},
    })

    const [form, setForm] = useState(null)
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const { loading, error, data } = useQuery(MODEL_QUERY, {
        variables: { modelName },
    })

    const currentPrivileges = data?.model?.workflow ? user.privilegesForModelAndWorkflowNode(modelName, data.model.workflow.currentNode) : []

    // set initial formData
    useEffect(() => {
        if (!form?.state) return
        onChange(form.state.formData)
    }, [form])

    // save changes to form in localstorage for later retrieval
    useEffect(() => {
        // make sure at least one field is filled out to save the form data
        if (localChanges.formData && Object.entries(localChanges.formData).length > 0) {
            localStorage.setItem(getLocalStorageKey(), JSON.stringify(localChanges))    
        } else {
            // if we've previously saved, but user cleared out all the inputs, remove the item
            localStorage.removeItem(getLocalStorageKey())
        }       
    }, [localChanges])

    function getLocalStorageKey() {
        return `meditor.${modelName}.${localChanges.localId}`
    }

    function redirectToDocumentEdit(document) {
        let documentName = urlEncode(document[data.model.titleProperty])
        router.push('/meditor/[modelName]/[documentTitle]', `/meditor/${urlEncode(modelName)}/${documentName}`)
    }

    async function createDocument(document) {
        document['x-meditor'] = {}
        document['x-meditor'].model = modelName

        let documentBlob = new Blob([JSON.stringify(document)])

        try {
            await mEditorApi.putDocument(documentBlob)

            // remove the unsaved changes from localStorage
            localStorage.removeItem(getLocalStorageKey())

            setSuccessNotification('Successfully created the document')
            redirectToDocumentEdit(document)
        } catch (err) {
            console.error('Failed to create document ', err)
            setErrorNotification('Failed to create the document')
        }
    }

    function onChange(formData: any) {
        let titleProperty = data?.model?.titleProperty
        let title = (titleProperty && formData[titleProperty]) ? formData[titleProperty] : UNTITLED_DOCUMENT_TITLE

        setLocalChanges({
            ...localChanges,
            formData: omitBy(formData, (value) => typeof value === 'undefined' || (Array.isArray(value) && !value.length)),
            title,
        })
    }

    return (
        <div>
            <PageTitle title={['Add New', modelName]} />

            <Breadcrumbs>
                <Breadcrumb title={modelName} href="/meditor/[modelName]" as={`/meditor/${modelName}`} />
                <Breadcrumb title="New" />
            </Breadcrumbs>

            <DocumentHeader model={data?.model} />

            <RenderResponse
                loading={loading}
                error={error}
                loadingComponent={<Loading text={`Loading...`} />}
                errorComponent={
                    <Alert variant="danger">
                        <p>Failed to load the page.</p>
                        <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                        <p>If the error continues to occur, please open a support ticket.</p>
                    </Alert>
                }
            >
                <Form model={data?.model} document={localChanges?.formData} onUpdateForm={setForm} onChange={onChange} />
                
                {form?.state && (
                    <FormActions  
                        privileges={currentPrivileges}
                        form={form} 
                        formData={localChanges?.formData}
                        onSave={createDocument}
                    />
                )}
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(NewDocumentPage))
