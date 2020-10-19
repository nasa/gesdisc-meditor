import styles from './document-header.module.css'
import ModelIcon from '../model-icon'
import DocumentStateBadge from './document-state-badge'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { MdHistory, MdComment, MdCode } from 'react-icons/md'

const DocumentHeader = ({
    document = null,
    model,
    version = null,
    togglePanelOpen,
    privileges = [],
    comments = [],
    history = [],
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
                         <OverlayTrigger
                            overlay={
                                <Tooltip id="comments-tooltip">
                                    Show Comments Panel
                                </Tooltip>
                            }
                        >
                            <Button variant="primary" onClick={() => togglePanelOpen('comments')}>
                                <MdComment />
                                <Badge className={styles.badge} variant="light">
                                    {comments.length}
                                </Badge>
                                <span className="sr-only">comments</span>
                            </Button>
                        </OverlayTrigger>
                    )}

                    <OverlayTrigger
                        overlay={
                            <Tooltip id="history-tooltip">
                                Show History Panel
                            </Tooltip>
                        }
                    >
                        <Button variant="primary" onClick={() => togglePanelOpen('history')}>
                            <MdHistory />
                            <Badge className={styles.badge} variant="light">
                                {history.length}
                            </Badge>
                            <span className="sr-only">history items</span>
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        overlay={
                            <Tooltip id="source-tooltip">
                                Show Document Source
                            </Tooltip>
                        }
                    >
                        <Button variant="primary" onClick={() => togglePanelOpen('source')}>
                            <MdCode />
                            <span className="sr-only">Source</span>
                        </Button>
                    </OverlayTrigger>

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
