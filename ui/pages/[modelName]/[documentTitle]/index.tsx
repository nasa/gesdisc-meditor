import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../../components/app-store'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../../lib/apollo'
import Alert from 'react-bootstrap/Alert'
import RenderResponse from '../../../components/render-response'
import Loading from '../../../components/loading'
import PageTitle from '../../../components/page-title'
import Form from '../../../components/form'
import { Breadcrumbs, Breadcrumb } from '../../../components/breadcrumbs'
import DocumentHeader from '../../../components/document-header'
import withAuthentication from '../../../components/with-authentication'
import FormActions from '../../../components/form-actions'
import mEditorApi from '../../../service/'

const DOCUMENT_QUERY = gql`
    query getDocument($modelName: String!, $title: String!) {
        document(modelName: $modelName, title: $title) {
            title
            doc
            state
            version
        }
    }
`

const MODEL_QUERY = gql`
    query getModel($modelName: String!, $currentState: String!) {
        model(modelName: $modelName, currentState: $currentState) {
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
                    id
                    privileges {
                        role
                        privilege
                    }
                }
                currentEdges {
                    role
                    source
                    target
                    label
                }
            }
        }
    }
`

const EditDocumentPage = ({ user }) => {
    const router = useRouter()
    const params = router.query
    const documentTitle = params.documentTitle as string
    const modelName = params.modelName as string

    const [form, setForm] = useState(null)
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const documentResponse = useQuery(DOCUMENT_QUERY, {
        variables: { modelName, title: documentTitle },
        fetchPolicy: 'network-only',
    })

    const [loadModel, modelResponse] = useLazyQuery(MODEL_QUERY, {
        fetchPolicy: 'network-only',
    })

    useEffect(() => {
        if (!documentResponse.data) return

        loadModel({
            variables: {
                modelName,
                currentState: documentResponse.data.document.state,
            },
        })
    }, [documentResponse.data])

    const currentPrivileges = modelResponse?.data?.model?.workflow
        ? user.privilegesForModelAndWorkflowNode(modelName, modelResponse.data.model.workflow.currentNode)
        : []

    function reloadDocument() {
        setTimeout(() => location.reload(), 500)
    }

    async function saveDocument(document) {
        delete document._id
        delete document.banTransitions
        document['x-meditor'] = {}
        document['x-meditor'].model = modelName

        let documentBlob = new Blob([JSON.stringify(document)])

        try {
            await mEditorApi.putDocument(documentBlob)

            setSuccessNotification('Successfully updated the document')
            reloadDocument()
        } catch (err) {
            console.error('Failed to create document ', err)
            setErrorNotification('Failed to create the document')
        }
    }

    async function updateDocumentState(state) {
        await mEditorApi.changeDocumentState(modelName, documentTitle, state, documentResponse.data.version)
        reloadDocument()
    }

    return (
        <div>
            <PageTitle title={[documentTitle, modelName]} />

            <Breadcrumbs>
                <Breadcrumb title={modelName} href="/[modelName]" as={`/${modelName}`} />
                <Breadcrumb title={documentTitle} />
            </Breadcrumbs>

            <DocumentHeader model={modelResponse?.data?.model} />

            <RenderResponse
                loading={documentResponse.loading}
                error={documentResponse.error}
                loadingComponent={<Loading text={`Loading...`} />}
                errorComponent={
                    <Alert variant="danger">
                        <p>Failed to retrieve document: {documentTitle}</p>
                        <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                        <p>If the error continues to occur, please open a support ticket.</p>
                    </Alert>
                }
            >
                <Form
                    model={modelResponse?.data?.model}
                    document={documentResponse?.data?.document}
                    onUpdateForm={setForm}
                />

                <FormActions privileges={currentPrivileges} form={form} onSave={saveDocument} onUpdateState={updateDocumentState} actions={modelResponse?.data?.model?.workflow?.currentEdges} />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(EditDocumentPage))
