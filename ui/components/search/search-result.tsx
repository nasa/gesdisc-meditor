import Link from 'next/link'
import DocumentStateBadge from '../document/document-state-badge'
import StateBadge from '../state-badge'
import styles from './search-result.module.css'
import { urlEncode } from '../../lib/url'
import { format } from 'date-fns'
import { FaRegClone } from 'react-icons/fa'
import { IoMdTrash } from 'react-icons/io'
import IconButton from '../icon-button'
import CloneDocumentModal from '../document/clone-document-modal'
import { useContext, useState } from 'react'
import { AppContext } from '../app-store'
import { removeUnsavedDocumentFromLS } from '../../lib/unsaved-changes'

const SearchResult = ({ document, modelName, onCloned, isLocalDocument = false }) => {
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

        removeUnsavedDocumentFromLS(document)
        setSuccessNotification(`Successfully deleted document: '${document.title}'`)
    }

    return (
        <div className={styles.result}>
            <div>
                <Link
                    href={
                        isLocalDocument
                            ? '/meditor/[modelName]/new'
                            : '/meditor/[modelName]/[documentTitle]'
                    }
                    as={
                        isLocalDocument
                            ? `/meditor/${urlEncode(document.model)}/new?localId=${
                                  document.localId
                              }`
                            : `/meditor/${urlEncode(document.model)}/${urlEncode(
                                  document.title
                              )}`
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
