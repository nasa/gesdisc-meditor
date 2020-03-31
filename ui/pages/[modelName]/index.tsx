import { useQuery } from '@apollo/react-hooks'
import { useContext } from 'react'
import { AppContext } from '../../components/app-store'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import Alert from 'react-bootstrap/Alert'
import { withApollo } from '../../lib/apollo'
import SearchBar from '../../components/search-bar'
import SearchList from '../../components/search-list'
import RenderResponse from '../../components/render-response'
import Loading from '../../components/loading'
import PageTitle from '../../components/page-title'

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
            modifiedOn (format:"M/dd/yyyy, h:mm a")
            state
        }
    }
`

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const ModelPage = () => {
    const router = useRouter()
    const { modelName } = router.query

    const { 
        searchTerm,
        setSearchTerm,
        sortDir,
        setSortDir,
        filterBy,
        setFilterBy
    } = useContext(AppContext)

    const { loading, error, data } = useQuery(MODEL_DOCUMENTS_QUERY, {
        variables: { modelName },
    })

    function addNewDocument() {
        router.push('/[modelName]/new', `/${modelName}/new`)
    }

    return (
        <div>
            <PageTitle title={modelName} />

            <SearchBar model={data?.model} modelName={modelName} initialInput={searchTerm} onInput={(searchTerm) => setSearchTerm(searchTerm)} />

            <div className="my-4">
                <RenderResponse
                    loading={loading}
                    error={error}
                    loadingComponent={
                        <Loading text={`Loading...`} />
                    }
                    errorComponent={
                        <Alert variant="danger">
                            <p>Failed to retrieve {modelName} documents.</p>
                            <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                        </Alert>
                    }
                >
                    <SearchList 
                        modelName={modelName} 
                        documents={data?.documents} 
                        onAddNew={addNewDocument}
                        searchTerm={searchTerm}
                        sortDir={sortDir}
                        onSortDirChange={setSortDir}
                        filterBy={filterBy}
                        onFilterByChange={setFilterBy}
                    />
                </RenderResponse>
            </div>
        </div>
    )
}

export default withApollo({ ssr: true })(ModelPage)

