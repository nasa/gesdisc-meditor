import Link from 'next/link'
import Alert from 'react-bootstrap/Alert'

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
const SearchList = ({ documents, searchTerm = '' }) => {
    if (!documents?.length) {
        return (
            <Alert variant="info">
                No documents found.
            </Alert>
        )
    }
    
    return (
        <div>
            {documents
                .filter(document => documentMatchesSearchTerm(document, searchTerm))
                .map(document => (
                    <div key={document.title}>
                        <Link href="/[modelName]/[documentTitle]" as={`/${document.model}/${document.title}`}>
                            <a>{document.title}</a>
                        </Link>
                    </div>
                )
            )}
        </div>
    )
}

export default SearchList
