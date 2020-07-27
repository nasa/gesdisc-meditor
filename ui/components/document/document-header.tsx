import styles from './document-header.module.css'
import ModelIcon from '../model-icon'
import DocumentStateBadge from './document-state-badge'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import { MdHistory, MdComment } from 'react-icons/md'
import StateBadge from '../state-badge'
import { format } from 'date-fns'
import { useRouter } from 'next/router'

const DocumentHeader = ({
    document = null,
    localDocument = null,
    model,
    toggleCommentsOpen = () => {},
    toggleHistoryOpen = () => {},
    privileges = [],
    comments = [],
    history = [],
}) => {
    const router = useRouter()
    const params = router.query
    const localId = params.localId as string

    return (
        <div>
            <div className={styles.title}>
                <ModelIcon name={model?.icon?.name} color={model?.icon?.color} />
                {model?.name}
            </div>

            <div className={styles.description}>{model?.description}</div>

            {(localDocument && localId) && (
                <div className={styles.subheader}>
                    <StateBadge variant="warning">Unsaved</StateBadge>

                    <div>
                        <em>
                            (autosaved on {format(new Date(localDocument.modifiedOn), 'M/d/yy, h:mm aaa')})
                        </em>
                    </div>
                </div>
            )}

            {document && (
                <div className={styles.subheader}>
                    {privileges.includes('comment') && (
                        <Button variant="primary" onClick={toggleCommentsOpen}>
                            <MdComment />
                            <Badge className={styles.badge} variant="light">
                                {comments.length}
                            </Badge>
                            <span className="sr-only">comments</span>
                        </Button>
                    )}

                    <Button variant="primary" onClick={toggleHistoryOpen}>
                        <MdHistory />
                        <Badge className={styles.badge} variant="light">
                            {history.length}
                        </Badge>
                        <span className="sr-only">history items</span>
                    </Button>

                    <DocumentStateBadge document={document} />

                    <div>
                        <em>
                            (edited by {document?.modifiedBy} on {document?.modifiedOn})
                        </em>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DocumentHeader
