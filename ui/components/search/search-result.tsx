import Link from 'next/link'
import DocumentStateBadge from '../document/document-state-badge'
import styles from './search-result.module.css'
import { urlEncode } from '../../lib/url'

const SearchResult = ({ document, modelName }) => {
    return (
        <div className={styles.result}>
            <div>
                <Link href="/meditor/[modelName]/[documentTitle]" as={`/meditor/${urlEncode(document.model)}/${urlEncode(document.title)}`}>
                    <a>{document.title}</a>
                </Link>

                <DocumentStateBadge document={document} modelName={modelName} />
            </div>

            <div>
                {document.modifiedOn} by {document.modifiedBy}
            </div>
        </div>
    )
}

export default SearchResult
