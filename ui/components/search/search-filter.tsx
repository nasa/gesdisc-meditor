import styles from './search-filter.module.css'

const SearchFilter = ({ label, field }) => {
    return (
        <div className={styles.action}>
            <label>
                {label}: 
                
                <span>field goes here</span>
            </label>
        </div>
    )
}

export default SearchFilter
