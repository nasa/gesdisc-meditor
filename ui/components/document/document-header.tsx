import styles from './document-header.module.css'
import ModelIcon from '../model-icon'
import DocumentStateBadge from './document-state-badge'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import { MdHistory, MdComment, MdCode } from 'react-icons/md'

const DocumentHeader = ({
    document = null,
    model,
    version = null,
    toggleCommentsOpen = () => {},
    toggleHistoryOpen = () => {},
    toggleSourceOpen = () => {},
    privileges = [],
    comments = [],
    history = [],
    source = []
}) => {
    return (
        <div>
            <div className={styles.title}>
                <ModelIcon name={model?.icon?.name} color={model?.icon?.color} />
                {model?.name}
            </div>

            <div className={styles.description}>{model?.description}</div>

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

                    <Button variant="primary" onClick={toggleSourceOpen}>
                        <MdCode />
                        <span className="sr-only">Source</span>
                    </Button>

                    {model?.name && (
                        <DocumentStateBadge
                            document={document}
                            modelName={model.name}
                            version={version}
                            showPublicationStatus={true}
                        />
                    )}

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
