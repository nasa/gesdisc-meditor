import { useQuery } from '@apollo/react-hooks'
import { useState, useEffect } from 'react'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import { withApollo } from '../../lib/apollo'
import SearchBar from '../../components/search-bar'

const QUERY = gql`
    query getDocuments($modelName: String!) {
        documents(modelName: $modelName) {
            title
            modifiedBy
            modifiedOn
            state
        }
    }
`

/**
 * determines if a document contains a given search term
 * @param document 
 * @param searchTerm 
 */
function documentMatchesSearchTerm(document, searchTerm) {
    return document?.title?.search(new RegExp(searchTerm, 'i')) !== -1
}

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

            {loading && <div>loading</div>}
            {error && <div>error</div>}
            
            {data?.documents
                .filter(document => documentMatchesSearchTerm(document, searchTerm))
                .map(document => (
                    <div key={document.title}>
                        {document.title}
                    </div>
                )
            )}
        </div>
    )
}

export default withApollo({ ssr: true })(ModelPage)

