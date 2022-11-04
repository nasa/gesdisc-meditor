import { format } from 'date-fns'
import Link from 'next/link'
import { useContext, useState } from 'react'
import { FaRegClone } from 'react-icons/fa'
import { IoMdTrash } from 'react-icons/io'
import {
    removeUnsavedDocumentFromLS,
    UnsavedDocument,
} from '../../lib/unsaved-changes'
import type { Document } from '../../models/types'
import { AppContext } from '../app-store'
import CloneDocumentModal from '../document/clone-document-modal'
import DocumentStateBadge from '../document/document-state-badge'
import IconButton from '../icon-button'
import StateBadge from '../state-badge'
import styles from './search-result.module.css'

interface SearchResultProps {
    document: Document | UnsavedDocument
    modelName: string
    onCloned?: Function
    onDelete?: Function
    isLocalDocument?: boolean
}

const SearchResult = ({
    document,
    modelName,
    onCloned,
    onDelete,
    isLocalDocument,
}: SearchResultProps) => {
    const { setSuccessNotification } = useContext(AppContext)
    const [showCloneDocumentModal, setShowCloneDocumentModal] = useState(false)

    function removeUnsavedDocument() {
        if (
            !confirm(
                "Are you sure you want to delete this document?\n\nThis document will be deleted immediately. You can't undo this action."
            )
        ) {
            return
        }

        removeUnsavedDocumentFromLS(document as UnsavedDocument)
        setSuccessNotification(`Successfully deleted document: '${document.title}'`)
        onDelete?.(document)
    }

    return (
        <div className={styles.result}>
            <div>
                <Link
                    href={
                        isLocalDocument
                            ? `/${encodeURIComponent(document.model)}/new?localId=${
                                  document.localId
                              }`
                            : `/${encodeURIComponent(
                                  document.model
                              )}/${encodeURIComponent(document.title)}`
                    }
                >
                    <a dangerouslySetInnerHTML={{ __html: document.title }} />
                </Link>
            </div>

            <div>
                {isLocalDocument && (
                    <StateBadge variant="warning">Unsaved</StateBadge>
                )}
                {!isLocalDocument && (
                    <DocumentStateBadge document={document} modelName={modelName} />
                )}
            </div>

            <div>{format(new Date(document.modifiedOn), 'M/d/yy, h:mm aaa')}</div>

            <div>{document.modifiedBy}</div>

            <div>
                {isLocalDocument && (
                    <IconButton alt="Delete Document" onClick={removeUnsavedDocument}>
                        <IoMdTrash />
                    </IconButton>
                )}

                {!isLocalDocument && (
                    <IconButton
                        alt="Clone Document"
                        onClick={() => setShowCloneDocumentModal(true)}
                    >
                        <FaRegClone />
                    </IconButton>
                )}
            </div>

            <CloneDocumentModal
                modelName={modelName}
                documentTitle={document.title}
                show={showCloneDocumentModal}
                onCancel={() => setShowCloneDocumentModal(false)}
                onSuccess={newDocument => {
                    setShowCloneDocumentModal(false)
                    onCloned()
                }}
            />
        </div>
    )
}

export default SearchResult
