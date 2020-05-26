import { useQuery } from '@apollo/react-hooks'
import { useContext } from 'react'
import { AppContext } from '../../components/app-store'
import { useRouter } from 'next/router'
import Alert from 'react-bootstrap/Alert'
import { withApollo } from '../../lib/apollo'
import SearchBar from '../../components/search/search-bar'
import SearchList from '../../components/search/search-list'
import RenderResponse from '../../components/render-response'
import Loading from '../../components/loading'
import PageTitle from '../../components/page-title'
import withAuthentication from '../../components/with-authentication'
import { MODEL_DOCUMENTS_QUERY } from './queries'

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const ModelPage = ({ user }) => {
    const router = useRouter()
    const { modelName } = router.query

    const { searchTerm, setSearchTerm } = useContext(AppContext)

    const { loading, error, data } = useQuery(MODEL_DOCUMENTS_QUERY, {
        variables: { modelName },
        fetchPolicy: 'cache-and-network',
    })

    function addNewDocument() {
        router.push('/[modelName]/new', `/${modelName}/new`)
    }

    return (
        <div>
            <PageTitle title={modelName} />

            <SearchBar
                model={data?.model}
                modelName={modelName}
                initialInput={searchTerm}
                onInput={searchTerm => setSearchTerm(searchTerm)}
            />

            <div className="my-4">
                <RenderResponse
                    loading={loading}
                    error={error}
                    loadingComponent={<Loading text={`Loading...`} />}
                    errorComponent={
                        <Alert variant="danger">
                            <p>Failed to retrieve {modelName} documents.</p>
                            <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                        </Alert>
                    }
                >
                    <SearchList
                        documents={data?.documents}
                        onAddNew={addNewDocument}
                        user={user}
                    />
                </RenderResponse>
            </div>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(ModelPage))
