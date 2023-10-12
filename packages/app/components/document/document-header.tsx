import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { BsBraces } from 'react-icons/bs'
import { FcFlowChart } from 'react-icons/fc'
import { MdComment, MdCompare, MdHistory } from 'react-icons/md'
import ModelIcon from '../model-icon'
import styles from './document-header.module.css'
import DocumentStateBadge from './document-state-badge'

const DocumentHeader = ({
    activePanel = null,
    document = null,
    isJsonPanelOpen = false,
    model,
    version = null,
    toggleJsonDiffer,
    togglePanelOpen,
    privileges = [],
    comments = [],
    history = [],
}) => {
    const numberOfComments =
        comments === null ? 0 : comments.filter(c => !c.resolved).length
    const numberOfHistoryEntries = history === null ? 0 : history.length

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
                                    {activePanel === 'comments' ? `Hide ` : `Show `}
                                    Comments Panel
                                </Tooltip>
                            }
                        >
                            <Button
                                aria-pressed={activePanel === 'comments'}
                                variant="primary"
                                onClick={() => togglePanelOpen('comments')}
                            >
                                <MdComment />
                                <Badge className={styles.badge} variant="light">
                                    {numberOfComments}
                                </Badge>
                                <span className="sr-only">Show Comments Panel</span>
                            </Button>
                        </OverlayTrigger>
                    )}

                    <OverlayTrigger
                        overlay={
                            <Tooltip id="history-tooltip">
                                {activePanel === 'history' ? `Hide ` : `Show `}
                                History Panel
                            </Tooltip>
                        }
                    >
                        <Button
                            aria-pressed={activePanel === 'history'}
                            variant="primary"
                            onClick={() => togglePanelOpen('history')}
                        >
                            <MdHistory />
                            <Badge className={styles.badge} variant="light">
                                {numberOfHistoryEntries}
                            </Badge>
                            <span className="sr-only">Show History Panel</span>
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        overlay={
                            <Tooltip id="compare-tooltip">
                                {isJsonPanelOpen ? `Hide ` : `Show `}
                                Compare Document Versions
                            </Tooltip>
                        }
                    >
                        <Button
                            aria-pressed={isJsonPanelOpen}
                            className="d-flex align-items-center"
                            variant="primary"
                            onClick={() => {
                                toggleJsonDiffer()
                            }}
                        >
                            <MdCompare style={{ fontSize: '1.6em' }} />
                            <span className="sr-only">Compare Document Versions</span>
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        overlay={
                            <Tooltip id="source-tooltip">
                                {activePanel === 'source' ? `Hide ` : `Show `}
                                Document Source
                            </Tooltip>
                        }
                    >
                        <Button
                            aria-pressed={activePanel === 'source'}
                            variant="primary"
                            onClick={() => togglePanelOpen('source')}
                        >
                            <BsBraces />
                            <span className="sr-only">Show Document Source</span>
                        </Button>
                    </OverlayTrigger>

                    {model?.name?.toLowerCase() === 'workflows' && (
                        <OverlayTrigger
                            overlay={
                                <Tooltip id="workflow-tooltip">
                                    {activePanel === 'workflow' ? `Hide ` : `Show `}
                                    Document Workflow
                                </Tooltip>
                            }
                        >
                            <Button
                                aria-pressed={activePanel === 'workflow'}
                                variant="primary"
                                onClick={() => {
                                    togglePanelOpen('workflow')
                                }}
                            >
                                <FcFlowChart className={styles.flowChartIcon} />
                                <span className="sr-only">
                                    Show Document Workflow
                                </span>
                            </Button>
                        </OverlayTrigger>
                    )}

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
                            (edited by {document?.modifiedBy} on{' '}
                            {document?.modifiedOn})
                        </em>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DocumentHeader
