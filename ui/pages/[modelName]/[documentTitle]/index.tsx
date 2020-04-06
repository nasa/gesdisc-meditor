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
        }
        document(modelName: $modelName, title: $title) {
            title
            doc
            state
        }
    }
`

const EditDocumentPage = () => {
    const router = useRouter()
    const { modelName, documentTitle } = router.query

    const { loading, error, data } = useQuery(QUERY, {
        variables: { modelName, title: documentTitle },
        fetchPolicy: 'cache-and-network',
    })
    
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
                <Form model={data?.model} document={data?.document} liveValidate={true} />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(EditDocumentPage))

