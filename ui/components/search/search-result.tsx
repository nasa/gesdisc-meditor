import Link from 'next/link'
import DocumentStateBadge from '../document/document-state-badge'
import StateBadge from '../state-badge'
import styles from './search-result.module.css'
import { urlEncode } from '../../lib/url'
import { format } from 'date-fns'
import { FaRegClone } from 'react-icons/fa'
import IconButton from '../icon-button'
import CloneDocumentModal from '../document/clone-document-modal'
import { useState } from 'react'

const SearchResult = ({ document, modelName, isLocalDocument = false }) => {
    const [showCloneDocumentModal, setShowCloneDocumentModal] = useState(false)

    return (
        <div className={styles.result}>
            <div>
                <div>
                    <Link
                        href={isLocalDocument ? '/meditor/[modelName]/new' : '/meditor/[modelName]/[documentTitle]'}
                        as={
                            isLocalDocument
                                ? `/meditor/${urlEncode(document.model)}/new?localId=${document.localId}`
                                : `/meditor/${urlEncode(document.model)}/${urlEncode(document.title)}`
                        }
                    >
                        <a>{document.title}</a>
                    </Link>

                    {isLocalDocument && <StateBadge variant="warning">Unsaved</StateBadge>}
                    {!isLocalDocument && <DocumentStateBadge document={document} modelName={modelName} />}
                </div>

                <div>
                    {isLocalDocument ? format(new Date(document.modifiedOn), 'M/d/yy, h:mm aaa') : document.modifiedOn}{' '}
                    by {document.modifiedBy}
                </div>
            </div>

            <div>
                <IconButton alt="Clone Document" onClick={() => setShowCloneDocumentModal(true)}>
                    <FaRegClone />
                </IconButton>
            </div>

            <CloneDocumentModal
                modelName={modelName}
                documentTitle={document.title}
                show={showCloneDocumentModal}
                onCancel={() => setShowCloneDocumentModal(false)}
                onSuccess={() => console.log('success!')}
            />
        </div>
    )
}

export default SearchResult
