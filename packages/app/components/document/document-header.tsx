import type { Collaborator } from 'collaboration/types'
import type { DocumentComment } from 'comments/types'
import type { Document, DocumentHistory } from 'documents/types'
import type { ModelWithWorkflow } from 'models/types'
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

type PropsType = {
    activePanel: string
    document: Document
    isJsonPanelOpen: boolean
    model: ModelWithWorkflow
    version: any
    toggleJsonDiffer: () => void
    togglePanelOpen: (panel: string) => void
    privileges: string[]
    comments: DocumentComment[]
    history: DocumentHistory[]
    collaborators: Collaborator[]
}

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
    collaborators = [],
}: PropsType) => {
    const numberOfComments =
        comments === null ? 0 : comments.filter(c => !c.resolved).length
    const numberOfHistoryEntries = history === null ? 0 : history.length
    const sortedCollaborators = [...collaborators]
        .sort(({ hasBeenActive }) => (hasBeenActive ? -1 : 0))
        .sort(({ isActive }) => (isActive ? -1 : 0))
    const priorityCollaborators = sortedCollaborators.slice(0, 4)
    const plusCollaborators = sortedCollaborators.slice(4)

    return (
        <div className={styles.header}>
            <div className={styles.titleDescription}>
                <div className={styles.title}>
                    <ModelIcon name={model?.icon?.name} color={model?.icon?.color} />
                    <h2 className="h3">{model?.name}</h2>
                </div>

                <div className={styles.description}>{model?.description}</div>
            </div>

            <h3 className="sr-only">Collaborators</h3>
            <div className={styles.collaborators}>
                {priorityCollaborators.map(
                    ({
                        initials,
                        uid,
                        hasBeenActive,
                        isActive,
                        firstName,
                        lastName,
                    }) => {
                        return (
                            <span
                                key={uid}
                                className={`${styles.collaborator}`}
                                data-has-been-active={hasBeenActive}
                                data-is-active={isActive}
                                title={`${firstName} ${lastName} (${
                                    isActive
                                        ? 'actively collaborating'
                                        : hasBeenActive
                                        ? 'recently collaborating'
                                        : 'viewing'
                                })`}
                            >
                                <span aria-hidden="true">{initials}</span>
                                <span className="sr-only">{`${firstName} ${lastName} ${
                                    isActive
                                        ? 'is actively collaborating on'
                                        : hasBeenActive
                                        ? 'has recently been collaborating on'
                                        : 'is viewing'
                                } this document.`}</span>
                            </span>
                        )
                    }
                )}
                {plusCollaborators.length ? (
                    <span
                        className={styles.collaborator}
                        title={plusCollaborators
                            .map(
                                ({ firstName, lastName, isActive, hasBeenActive }) =>
                                    `${firstName} ${lastName} (${
                                        isActive
                                            ? 'actively collaborating'
                                            : hasBeenActive
                                            ? 'recently collaborating'
                                            : 'viewing'
                                    })`
                            )
                            .join(', ')}
                    >
                        {plusCollaborators.length < 10
                            ? `+${plusCollaborators.length}`
                            : `++`}
                    </span>
                ) : null}
            </div>

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
