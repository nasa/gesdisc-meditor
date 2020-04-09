import { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
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

const QUERY = gql`
    query getDocument($modelName: String!, $title: String!) {
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
                currentEdges {
                    role
                    source
                    target
                    label
                }
            }
        }
        document(modelName: $modelName, title: $title) {
            title
            doc
            state
        }
    }
`

const EditDocumentPage = ({ user }) => {
    const router = useRouter()
    const { modelName, documentTitle } = router.query
    const [form, setForm] = useState(null)

    const { loading, error, data } = useQuery(QUERY, {
        variables: { modelName, title: documentTitle },
        fetchPolicy: 'cache-and-network',
    })

    const currentPrivileges = data?.model?.workflow ? user.privilegesForModelAndWorkflowNode(modelName, data.model.workflow.currentNode) : []

    async function saveDocument(document) {
        /*
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
        }*/
        console.log('save document')
    }
    
    return (
        <div>
            <PageTitle title={[documentTitle, modelName]} />

            <Breadcrumbs>
                <Breadcrumb title={modelName} href="/[modelName]" as={`/${modelName}`} />
                <Breadcrumb title={documentTitle} />
            </Breadcrumbs>

            <DocumentHeader model={data?.model} />

            <RenderResponse
                loading={loading}
                error={error}
                loadingComponent={
                    <Loading text={`Loading...`} />
                }
                errorComponent={
                    <Alert variant="danger">
                        <p>Failed to retrieve document: {documentTitle}</p>
                        <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                        <p>If the error continues to occur, please open a support ticket.</p>
                    </Alert>
                }
            > 
                <Form model={data?.model} document={data?.document} onUpdateForm={setForm} />
                
                <FormActions  
                    privileges={currentPrivileges}
                    form={form} 
                    onSave={saveDocument}
                />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(EditDocumentPage))

