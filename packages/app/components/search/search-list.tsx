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
    onAddNew: Function
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
    user,
    onSortChange,
    onFilterChange,
}: SearchListProps) => {
    const [currentPage, setCurrentPage] = useState(0)
    const [localDocuments, setLocalDocuments] = useState([])

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
            >
                {text}
            </div>
        )
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
                onFilterChange={onFilterChange}
            />

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
                                    />
                                )
                            } else {
                                return (
                                    <SearchResult
                                        key={document.title}
                                        document={document}
                                        modelName={model.name}
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
