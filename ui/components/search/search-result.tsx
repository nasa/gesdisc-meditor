import Link from 'next/link'
import DocumentStateBadge from '../document/document-state-badge'
import styles from './search-result.module.css'

const SearchResult = ({ document }) => {
    return (
        <div className={styles.result}>
            <div>
                <Link href="/[modelName]/[documentTitle]" as={`/${encodeURIComponent(document.model)}/${encodeURIComponent(document.title)}`}>
                    <a>{document.title}</a>
                </Link>

                <DocumentStateBadge document={document} />
            </div>

            <div>
                {document.modifiedOn} by {document.modifiedBy}
            </div>
        </div>
    )
}

export default SearchResult
