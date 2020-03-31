import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../../lib/apollo'
import Alert from 'react-bootstrap/Alert'
import RenderResponse from '../../../components/render-response'
import Loading from '../../../components/loading'
import PageTitle from '../../../components/page-title'

const QUERY = gql`
    query getDocument($modelName: String!, $title: String!) {
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
    })

    let fakeLayout = {
        "ui:order": [
            "title",
            "abstract",
            "example",
            "prereq",
            "procedure",
            "additionalInfo",
            "relatedHowto",
            "datasets",
            "tags",
            "groups",
            "notebook",
            "notes",
            "*"
        ]
    }
    
    return (
        <div>
            <PageTitle title={[documentTitle, modelName]} />

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
                <div>edit form here</div>
            </RenderResponse>
        </div>
    )

    /*
    <JsonSchemaForm
                    schema={data ? JSON.parse(data.model?.schema) : {}}
                    formData={data ? data.document?.doc : {}}
                    layout={fakeLayout}
                    liveValidate={true}
                    onChange={(e) => console.log('form changed! ', e)}
                    onSubmit={() => {}}
                    onError={(err) => console.log('error occured ', err)}
                /> */
}

export default withApollo({ ssr: true })(EditDocumentPage)

