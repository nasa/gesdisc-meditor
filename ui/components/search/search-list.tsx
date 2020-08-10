import SearchStatusBar from './search-status-bar'
import SearchResult from './search-result'
import { useEffect, useState } from 'react'
import { findUnsavedDocumentsByModel } from '../../lib/unsaved-changes'
import styles from './search-list.module.css'
import { IoMdArrowDropdown } from 'react-icons/io'
import Pagination from '../pagination'

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
 * @param direction
 * @param property
 * @param isDate
 * @param documentA
 * @param documentB
 */
function sortDocuments(direction, property, isDate, documentA, documentB) {
    let a = documentA[property]
    let b = documentB[property]

    if (isDate) {
        a = new Date(a)
        b = new Date(b)
    }

    const diff = a > b ? -1 : a < b ? 1 : 0

    return direction == 'asc' ? diff * -1 : diff
}

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const SearchList = ({ documents, model, onAddNew, onRefreshList, user, searchOptions, onSortChange, onFilterChange }) => {
    const [currentPage, setCurrentPage] = useState(0)
    const [localChanges, setLocalChanges] = useState([])

    const itemsPerPage = 50
    const offset = currentPage * itemsPerPage

    // look for unsaved documents in local storage
    useEffect(() => {
        setLocalChanges(findUnsavedDocumentsByModel(model.name))
    }, [])

    let localDocuments = localChanges.sort(
        sortDocuments.bind(this, searchOptions.sort.direction, searchOptions.sort.property, searchOptions.sort.isDate)
    )

    let filteredDocuments = documents
        .filter((document) => documentMatchesSearchTerm(document, searchOptions.term))
        .filter((document) => documentHasState(document, searchOptions.filters.state))
        .sort(
            sortDocuments.bind(
                this,
                searchOptions.sort.direction,
                searchOptions.sort.property,
                searchOptions.sort.isDate
            )
        )

    let listDocuments = [].concat(localDocuments, filteredDocuments)

    let documentStates = documents
        .map((document) => document.state)
        .filter((state, index, states) => states.indexOf(state) === index)
        .sort()

    function Header({ text, sortBy = null, isDate = false }) {
        return (
            <div
                className={styles.header}
                style={{
                    cursor: sortBy ? 'pointer' : 'default',
                }}
                onClick={() => {
                    if (!sortBy) return // this is an unsortable column

                    onSortChange({
                        property: sortBy,
                        direction:
                            sortBy == searchOptions.sort.property && searchOptions.sort.direction == 'desc'
                                ? 'asc'
                                : 'desc',
                        isDate,
                    })
                }}
            >
                {text}

                {sortBy == searchOptions.sort.property && (
                    <IoMdArrowDropdown size="1.5em" className={styles[`sort-${searchOptions.sort.direction}`]} />
                )}
            </div>
        )
    }

    return (
        <div>
            <SearchStatusBar
                model={model}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                documentCount={offset}
                totalDocumentCount={listDocuments.length}
                onAddNew={onAddNew}
                documentStates={documentStates}
                user={user}
                searchOptions={searchOptions}
                onFilterChange={onFilterChange}
            />

            {listDocuments.length > 0 && (
                <div className={styles.grid}>
                    <Header text="Title" sortBy="title" />
                    <Header text="State" sortBy="state" />
                    <Header text="Modified On" sortBy="modifiedOn" isDate={true} />
                    <Header text="Modified By" sortBy="modifiedBy" />
                    <Header text="Actions" />

                    {listDocuments.slice(offset, offset + itemsPerPage).map((document) => {
                        if (document.localId) {
                            return (
                                <SearchResult
                                    key={document.localId}
                                    document={document}
                                    isLocalDocument={true}
                                    modelName={model.name}
                                />
                            )
                        } else {
                            return (
                                <SearchResult
                                    key={document.title}
                                    document={document}
                                    modelName={model.name}
                                    onCloned={onRefreshList}
                                />
                            )
                        }
                    })}
                </div>
            )}

            {listDocuments.length > itemsPerPage && (
                <Pagination
                    className="mt-4"
                    currentPage={currentPage}
                    totalItems={listDocuments.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(pageNum) => {
                        setCurrentPage(pageNum)
                        window.scrollTo(0, 0)
                    }}
                />
            )}
        </div>
    )
}

export default SearchList
