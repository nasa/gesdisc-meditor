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
import { MODEL_QUERY } from './queries'

const NewDocumentPage = ({ user }) => {
    const router = useRouter()
    const params = router.query
    const modelName = params.modelName as string

    const [form, setForm] = useState(null)
    const [formData, setFormData] = useState(null)
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const { loading, error, data } = useQuery(MODEL_QUERY, {
        variables: { modelName },
    })

    const currentPrivileges = data?.model?.workflow ? user.privilegesForModelAndWorkflowNode(modelName, data.model.workflow.currentNode) : []

    // set initial formData
    useEffect(() => {
        if (!form?.state) return
        
        setFormData(form.state.formData)
    }, [form])

    function redirectToDocumentEdit(document) {
        let documentName = encodeURIComponent(document[data.model.titleProperty])
        router.push('/[modelName]/[documentTitle]', `/${encodeURIComponent(modelName)}/${documentName}`)
    }

    async function createDocument(document) {
        document['x-meditor'] = {}
        document['x-meditor'].model = modelName

        let documentBlob = new Blob([JSON.stringify(document)])

        try {
            await mEditorApi.putDocument(documentBlob)

            setSuccessNotification('Successfully created the document')
            redirectToDocumentEdit(document)
        } catch (err) {
            console.error('Failed to create document ', err)
            setErrorNotification('Failed to create the document')
        }
    }

    function onChange(formData: any) {
        setFormData(formData)
    }

    return (
        <div>
            <PageTitle title={['Add New', modelName]} />

            <Breadcrumbs>
                <Breadcrumb title={modelName} href="/[modelName]" as={`/${modelName}`} />
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
                <Form model={data?.model} document={formData} onUpdateForm={setForm} onChange={onChange} />
                
                {form?.state && (
                    <FormActions  
                        privileges={currentPrivileges}
                        form={form} 
                        formData={formData}
                        onSave={createDocument}
                    />
                )}
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(NewDocumentPage))
