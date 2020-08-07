import SearchStatusBar from './search-status-bar'
import SearchResult from './search-result'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../app-store'
import { findUnsavedDocumentsByModel } from '../../lib/unsaved-changes'
import styles from './search-list.module.css'
import { IoMdArrowDropdown } from 'react-icons/io'

interface SortOptions {
    direction: 'desc' | 'asc'
    property: string
    isDate: boolean
}

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
 * @param sortOptions
 * @param documentA
 * @param documentB
 */
function sortDocuments(sortOptions: SortOptions, documentA, documentB) {
    let a = documentA[sortOptions.property]
    let b = documentB[sortOptions.property]

    if (sortOptions.isDate) {
        a = new Date(a)
        b = new Date(b)
    }

    const diff = a > b ? -1 : a < b ? 1 : 0

    return sortOptions.direction == 'asc' ? diff * -1 : diff
}

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const SearchList = ({
    documents,
    modelName,
    onAddNew,
    user,
}) => {
    const { searchTerm, filterBy } = useContext(AppContext)
    const [sortOptions, setSortOptions] = useState<SortOptions>({
        direction: 'desc',
        property: 'modifiedOn',
        isDate: true,
    })
    const [localChanges, setLocalChanges] = useState([])

    // look for unsaved documents in local storage
    useEffect(() => {
        setLocalChanges(findUnsavedDocumentsByModel(modelName))
    }, [])

    let localDocuments = localChanges
        .sort(sortDocuments.bind(this, sortOptions))

    let filteredDocuments = documents
        .filter(document => documentMatchesSearchTerm(document, searchTerm))
        .filter(document => documentHasState(document, filterBy))
        .sort(sortDocuments.bind(this, sortOptions))

    let documentStates = documents
        .map(document => document.state)
        .filter((state, index, states) => states.indexOf(state) === index)
        .sort()

    function Header({ text, sortBy = null, isDate = false }) {
        return (
            <div className={styles.header} onClick={() => {
                if (!sortBy) return     // this is an unsortable column

                setSortOptions({
                    property: sortBy,
                    direction: (sortBy == sortOptions.property && sortOptions.direction == 'desc') ? 'asc' : 'desc',
                    isDate,
                })
            }}>
                {text}

                {sortBy == sortOptions.property && (
                    <IoMdArrowDropdown size="1.5em" className={styles[`sort-${sortOptions.direction}`]} />
                )}
            </div>
        )
    }

    return (
        <div>
            <SearchStatusBar
                documentCount={filteredDocuments.length}
                totalDocumentCount={documents.length}
                onAddNew={onAddNew}
                documentStates={documentStates}
                user={user}
            />

            <div className={styles.grid}>
                <Header text="Title" sortBy="title" />
                <Header text="State" sortBy="state" />
                <Header text="Modified On" sortBy="modifiedOn" isDate={true} />
                <Header text="Modified By" sortBy="modifiedBy" />
                <Header text="Actions" />
                
                {localDocuments.map(localDocument => (
                    <SearchResult key={localDocument.localId} document={localDocument} isLocalDocument={true} modelName={modelName} />
                ))}

                {filteredDocuments.map(document => (
                    <SearchResult key={document.title} document={document} modelName={modelName} />
                ))}
            </div>
        </div>
    )
}

export default SearchList
