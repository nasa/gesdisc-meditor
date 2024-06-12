import { useEffect, useState } from 'react'
import { IoMdArrowDropdown } from 'react-icons/io'
import { findUnsavedDocumentsByModel } from '../../lib/unsaved-changes'
import type {
    DocumentsSearchOptions,
    Model,
    ModelWithWorkflow,
} from '../../models/types'
import type { Document } from '../../documents/types'
import type { User } from '../../auth/types'
import Pagination from '../pagination'
import styles from './search-list.module.css'
import SearchResult from './search-result'
import SearchStatusBar from './search-status-bar'

interface SearchListProps {
    documents: Document[]
    model: ModelWithWorkflow
    user: User
    searchOptions: DocumentsSearchOptions
    onAddNew: Function
    onRefreshList: Function
    onSortChange: Function
    onFilterChange: Function
}

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const SearchList = ({
    documents,
    model,
    onAddNew,
    onRefreshList,
    user,
    searchOptions,
    onSortChange,
    onFilterChange,
}: SearchListProps) => {
    const [currentPage, setCurrentPage] = useState(0)
    const [localDocuments, setLocalDocuments] = useState([])
    const [selectedDocuments, setSelectedDocuments] = useState([])

    const itemsPerPage = 50
    const offset = currentPage * itemsPerPage

    // look for unsaved documents in local storage
    useEffect(() => {
        refreshLocalDocuments()
    }, [])

    // combine local storage documents (unsaved) with database documents
    let listDocuments = [].concat(localDocuments, documents)

    function refreshLocalDocuments() {
        setLocalDocuments(findUnsavedDocumentsByModel(model.name))
    }

    function Header({ text, sortBy = null }) {
        return (
            <div
                className={styles.header}
                style={{
                    cursor: sortBy ? 'pointer' : 'default',
                }}
                onClick={() => {
                    if (!sortBy) return // this is an unsortable column

                    const sortByDesc = '-' + sortBy
                    onSortChange(
                        searchOptions.sort == sortByDesc ? sortBy : sortByDesc
                    )
                }}
            >
                {text}

                {searchOptions.sort.indexOf(sortBy) >= 0 && (
                    <IoMdArrowDropdown
                        size="1.5em"
                        className={
                            styles[
                                `sort-${
                                    searchOptions.sort.charAt(0) == '-'
                                        ? 'desc'
                                        : 'asc'
                                }`
                            ]
                        }
                    />
                )}
            </div>
        )
    }

    const toggleDocumentSelection = title => {
        setSelectedDocuments(prevSelected =>
            prevSelected.includes(title)
                ? prevSelected.filter(docTitle => docTitle !== title)
                : [...prevSelected, title]
        )
    }

    const toggleAllSelection = () => {
        if (listDocuments.length === selectedDocuments.length) {
            setSelectedDocuments([])
        } else {
            setSelectedDocuments(documents.map(doc => doc.title))
        }
    }

    return (
        <div>
            <SearchStatusBar
                model={model}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalDocumentCount={listDocuments.length}
                onAddNew={onAddNew}
                user={user}
                searchOptions={searchOptions}
                onFilterChange={onFilterChange}
            />
            <div className={styles.select}>
                <input
                    type="checkbox"
                    checked={
                        listDocuments.length > 0 &&
                        listDocuments.length === selectedDocuments.length
                    }
                    onChange={toggleAllSelection}
                />
                <label>Select All</label>
            </div>

            {listDocuments.length > 0 && (
                <div className={styles.grid}>
                    <Header text="Title" sortBy="title" />
                    <Header text="State" sortBy="x-meditor.state" />
                    <Header text="Modified On" sortBy="x-meditor.modifiedOn" />
                    <Header text="Modified By" sortBy="x-meditor.modifiedBy" />
                    <Header text="Actions" />

                    {listDocuments
                        .slice(offset, offset + itemsPerPage)
                        .map(document => {
                            if (document.localId) {
                                return (
                                    <SearchResult
                                        key={document.localId}
                                        document={document}
                                        isLocalDocument={true}
                                        modelName={model.name}
                                        onDelete={refreshLocalDocuments}
                                        selectedDocuments={selectedDocuments}
                                        toggleDocumentSelection={
                                            toggleDocumentSelection
                                        }
                                    />
                                )
                            } else {
                                return (
                                    <SearchResult
                                        key={document.title}
                                        document={document}
                                        modelName={model.name}
                                        onCloned={onRefreshList}
                                        selectedDocuments={selectedDocuments}
                                        toggleDocumentSelection={
                                            toggleDocumentSelection
                                        }
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
                    onPageChange={pageNum => {
                        setCurrentPage(pageNum)
                        window.scrollTo(0, 0)
                    }}
                />
            )}
        </div>
    )
}

export default SearchList
