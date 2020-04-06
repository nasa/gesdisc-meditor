import { useContext } from 'react'
import { AppContext } from '../../../components/app-store'
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
import mEditorApi from '../../../service/'
import withAuthentication from '../../../components/with-authentication'

const QUERY = gql`
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
        }
    }
`

const NewDocumentPage = () => {
    const router = useRouter()
    const params = router.query
    const modelName = params.modelName as string

    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const { loading, error, data } = useQuery(QUERY, {
        variables: { modelName },
    })

    function redirectToDocumentEdit(document) {
        let documentName = encodeURIComponent(document[data.model.titleProperty])
        router.push('/[modelName]/[documentTitle]', `/${encodeURIComponent(modelName)}/${documentName}`)
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
                <Form 
                    model={data?.model} 
                    onSave={async (document) => {
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
                    }}
                />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(NewDocumentPage))
