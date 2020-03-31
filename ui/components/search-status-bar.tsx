import styles from './search-status-bar.module.css'
import Button from 'react-bootstrap/Button'
import { MdAdd } from 'react-icons/md'

const SearchStatusBar = ({
    modelName,
    documentCount = 0,
    totalDocumentCount = 0,
    onAddNew,
    sortDir,
    onSortDirChange,
    documentStates = [],
    filterBy,
    onFilterByChange,
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.count}>
                Showing 1 - {documentCount} of {totalDocumentCount} {modelName} documents
            </div>

            <div className={styles.actions}>
                <div className={styles.action}>
                    <label>
                        Filter by:
                        <select
                            className="form-control"
                            value={filterBy}
                            onChange={e => onFilterByChange(e.target.value)}
                        >
                            <option value=""></option>

                            <optgroup label="State">
                                {documentStates.map(state => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </label>
                </div>

                <div className={styles.action}>
                    <label>
                        Sort by:
                        <select
                            className="form-control"
                            value={sortDir}
                            onChange={e => onSortDirChange(e.target.value)}
                        >
                            <option value="asc">Oldest</option>
                            <option value="desc">Newest</option>
                        </select>
                    </label>
                </div>

                <div className={styles.action}>
                    <Button variant="secondary" onClick={onAddNew}>
                        <MdAdd />
                        Add New
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SearchStatusBar
