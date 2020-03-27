import { useQuery } from '@apollo/react-hooks'
import { useState } from 'react'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import Alert from 'react-bootstrap/Alert'
import { withApollo } from '../../lib/apollo'
import SearchBar from '../../components/search-bar'
import SearchList from '../../components/search-list'
import RenderResponse from '../../components/render-response'
import Loading from '../../components/loading'

const QUERY = gql`
    query getDocuments($modelName: String!) {
        documents(modelName: $modelName) {
            title
            model
            modifiedBy
            modifiedOn
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

    const [searchTerm, setSearchTerm] = useState('')
    const { loading, error, data } = useQuery(QUERY, {
        variables: { modelName },
    })

    return (
        <div>
            <SearchBar modelName={modelName} onInput={(searchTerm) => setSearchTerm(searchTerm)} />

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
                    <SearchList documents={data?.documents} searchTerm={searchTerm} />
                </RenderResponse>
            </div>
        </div>
    )
}

export default withApollo({ ssr: true })(ModelPage)

