import SearchStatusBar from './search-status-bar'
import SearchResult from './search-result'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../app-store'
import { findUnsavedDocumentsByModel } from '../../lib/unsaved-changes'

/**
 * determines if a document contains a given search term
 * @param document
 * @param searchTerm
 */
function documentMatchesSearchTerm(document, searchTerm) {
    return document?.title?.search(new RegExp(searchTerm, 'i')) !== -1
}

/**
 * determines if a document has a given state
 * @param document
 * @param state
 */
function documentHasState(document, state) {
    if (!state) return true // if no state given, all documents should show
    return document.state == state
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
    documents,
    modelName,
    onAddNew,
    user,
    modelName,
}) => {
    const { searchTerm, sortDir, filterBy } = useContext(AppContext)
    const [localChanges, setLocalChanges] = useState([])

    // look for unsaved documents in local storage
    useEffect(() => {
        setLocalChanges(findUnsavedDocumentsByModel(modelName))
    }, [])

    let localDocuments = localChanges
        .sort(sortDocuments.bind(this, sortDir))

    let filteredDocuments = documents
        .filter(document => documentMatchesSearchTerm(document, searchTerm))
        .filter(document => documentHasState(document, filterBy))
        .sort(sortDocuments.bind(this, sortDir))

    let documentStates = documents
        .map(document => document.state)
        .filter((state, index, states) => states.indexOf(state) === index)
        .sort()

    return (
        <div>
            <SearchStatusBar
                documentCount={filteredDocuments.length}
                totalDocumentCount={documents.length}
                onAddNew={onAddNew}
                documentStates={documentStates}
                user={user}
            />

            {localDocuments.map(localDocument => (
                <SearchResult key={localDocument.localId} document={localDocument} isLocalDocument={true} />
            ))}

            {filteredDocuments.map(document => (
                <SearchResult key={document.title} document={document} modelName={modelName} />
            ))}
        </div>
    )
}

export default SearchList
