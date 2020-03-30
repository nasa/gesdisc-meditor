import styles from './search-status-bar.module.css'

const SearchStatusBar = ({
    modelName,
    documentCount = 0,
    totalDocumentCount = 0,
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
                <div className={styles.select}>
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

                <div className={styles.select}>
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
            </div>
        </div>
    )
}

export default SearchStatusBar
