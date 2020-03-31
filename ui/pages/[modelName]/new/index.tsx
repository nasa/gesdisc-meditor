import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../../lib/apollo'
import Alert from 'react-bootstrap/Alert'
import RenderResponse from '../../../components/render-response'
import Loading from '../../../components/loading'
import PageTitle from '../../../components/page-title'
import Form from '../../../components/form'

const QUERY = gql`
    query getModel($modelName: String!) {
        model(modelName: $modelName) {
            name
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
    const { modelName } = router.query

    const { loading, error, data } = useQuery(QUERY, {
        variables: { modelName },
    })

    return (
        <div>
            <PageTitle title={['Add New', modelName]} />

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
                <Form model={data?.model} />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(NewDocumentPage)
