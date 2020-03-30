import styles from './search-status-bar.module.css'

const SearchStatusBar = ({ 
    modelName, 
    documentCount = 0, 
    totalDocumentCount = 0, 
    sortDir,
    onSortDirChange,
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.count}>
                Showing 1 - {documentCount} of {totalDocumentCount} {modelName} documents
            </div>

            <div>
                <div className={styles.select}>
                    <label>
                        Sort by:
                        <select className="form-control" value={sortDir} onChange={e => onSortDirChange(e.target.value)}>
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
