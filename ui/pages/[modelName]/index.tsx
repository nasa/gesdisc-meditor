import { useContext } from 'react'
import { AppContext } from '../../components/app-store'
import { useRouter } from 'next/router'
import Alert from 'react-bootstrap/Alert'
import { withApollo } from '../../lib/apollo'
import SearchBar from '../../components/search/search-bar'
import SearchList from '../../components/search/search-list'
import PageTitle from '../../components/page-title'
import withAuthentication from '../../components/with-authentication'
import gql from 'graphql-tag'

const MODEL_DOCUMENTS_QUERY = gql`
    query getDocuments($modelName: String!) {
        model(modelName: $modelName) {
            name
            icon {
                name
                color
            }
        }
        documents(modelName: $modelName) {
            title
            model
            modifiedBy
            modifiedOn(format: "M/dd/yyyy, h:mm a")
            state
        }
    }
`

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const ModelPage = ({ user, model, documents }) => {
    const router = useRouter()
    const { modelName } = router.query

    const { searchTerm, setSearchTerm } = useContext(AppContext)

    function addNewDocument() {
        router.push('/meditor/[modelName]/new', `/meditor/${modelName}/new`)
    }

    return (
        <div>
            <PageTitle title={modelName} />

            <SearchBar
                model={model}
                modelName={modelName}
                initialInput={searchTerm}
                onInput={searchTerm => setSearchTerm(searchTerm)}
            />

            <div className="my-4">
                {!documents && (
                    <Alert variant="danger">
                        <p>Failed to retrieve {modelName} documents.</p>
                        <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                    </Alert>
                )}

                {documents && (
                    <SearchList
                        documents={documents}
                        onAddNew={addNewDocument}
                        user={user}
                    />
                )}
            </div>
        </div>
    )
}

ModelPage.getInitialProps = async (ctx) => {
    let response = await ctx.apolloClient.query({
        query: MODEL_DOCUMENTS_QUERY,
        variables: { 
            modelName: ctx.query.modelName,
        },
    })

    return {
        model: response?.data?.model,
        documents: response?.data?.documents,
    }
}

export default withApollo({ ssr: true })(withAuthentication()(ModelPage))
