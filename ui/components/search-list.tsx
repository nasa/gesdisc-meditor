import Link from 'next/link'
import Alert from 'react-bootstrap/Alert'
import SearchStatusBar from './search-status-bar'
import SearchResult from './search-result'

/**
 * determines if a document contains a given search term
 * @param document
 * @param searchTerm
 */
function documentMatchesSearchTerm(document, searchTerm) {
    return document?.title?.search(new RegExp(searchTerm, 'i')) !== -1
}

/**
 * sorts documents by modified date
 * @param sortDir 
 * @param documentA 
 * @param documentB 
 */
function sortDocuments(sortDir, documentA, documentB) {
    const a = new Date(documentA.modifiedOn)
    const b = new Date(documentB.modifiedOn)

    const diff = a > b ? -1 : a < b ? 1 : 0

    return sortDir == 'asc' ? diff * -1 : diff
}

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const SearchList = ({ 
    modelName, 
    documents, 
    searchTerm = '', 
    sortDir,
    onSortDirChange,
}) => {
    if (!documents?.length) {
        return <Alert variant="info">No documents found.</Alert>
    }

    let filteredDocuments = documents
        .filter(document => documentMatchesSearchTerm(document, searchTerm))
        .sort(sortDocuments.bind(this, sortDir))

    return (
        <div>
            <SearchStatusBar
                modelName={modelName}
                documentCount={filteredDocuments.length}
                totalDocumentCount={documents.length}
                sortDir={sortDir}
                onSortDirChange={onSortDirChange}
            />

            {filteredDocuments.map(document => (
                <SearchResult key={document.title} document={document} />
            ))}
        </div>
    )
}

export default SearchList
