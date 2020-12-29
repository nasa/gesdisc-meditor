import Card from 'react-bootstrap/Card'
import DocumentStateBadge from './document-state-badge'
import { FaRegDotCircle } from 'react-icons/fa'
import styles from './document-history.module.css'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import Button from 'react-bootstrap/Button'
import { useLocalStorage } from '../../lib/use-localstorage.hook'

const sortByLastModifiedDesc = (a, b) => {
    let dateA = new Date(a.modifiedOn)
    let dateB = new Date(b.modifiedOn)

    return dateA > dateB ? -1 : dateA < dateB ? 1 : 0
}

const PastState = ({ state }) => (
    <div className={styles.pastState}>
        <div>
            <FaRegDotCircle />

            <div>
                <div>{state.source}</div>
                <div>
                    <em>
                        {state.modifiedBy} on {state.modifiedOn}
                    </em>
                </div>
            </div>
        </div>
    </div>
)

const DocumentHistory = ({
    history = [],
    onVersionChange,
    onJSONDiffChange,
    showJSONView
}) => {
    const [historyPreferences, setHistoryPreferences] = useLocalStorage(
        'historyPreferences',
        {
            showDetails: false
        }
    )

    const toggleShowDetails = () => {
        setHistoryPreferences({
            ...historyPreferences,
            showDetails: !historyPreferences.showDetails
        })
    }

    function toggleActiveHistory(ev) {
        document
            .querySelectorAll('.document-history_card__1EVRh.card')
            .forEach(item => {
                item.classList.remove('document-history_activeHistory__5aP_p')
            })

        ev.target
            .closest('.card')
            .classList.add('document-history_activeHistory__5aP_p')
    }

    return (
        <div>
            <div className={styles.buttons}>
                <Button
                    className={styles.button}
                    variant="outline-dark"
                    onClick={toggleShowDetails}
                >
                    {historyPreferences.showDetails ? (
                        <>
                            <IoMdEyeOff />
                            Hide Details
                        </>
                    ) : (
                        <>
                            <IoMdEye />
                            Show Details
                        </>
                    )}
                </Button>
                <Button
                    className={styles.button}
                    variant="outline-dark"
                    active={showJSONView}
                    onClick={onJSONDiffChange}
                >
                    Show JSON Diff
                </Button>
            </div>

            {history.map((item, index) => (
                <Card
                    key={item.modifiedOn}
                    className={`${styles.card} ${
                        index === 0 ? 'document-history_activeHistory__5aP_p' : ''
                    }`}
                    onClick={ev => {
                        onVersionChange(item.modifiedOn)
                        toggleActiveHistory(ev)
                    }}
                >
                    <Card.Body>
                        <div className={styles.body}>
                            <div className={styles.meta}>
                                <a>{item.modifiedOn}</a>
                                {item.modifiedBy}
                            </div>

                            <div>
                                <DocumentStateBadge document={item} />
                            </div>
                        </div>

                        {item.states?.length > 0 && (
                            <div
                                className={`${styles.pastStates} ${
                                    historyPreferences.showDetails
                                        ? styles.visible
                                        : ''
                                }`}
                            >
                                {item.states
                                    ?.sort(sortByLastModifiedDesc)
                                    .map(state => (
                                        <PastState
                                            state={state}
                                            key={state.source + state.modifiiedOn}
                                        />
                                    ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            ))}
        </div>
    )
}

export default DocumentHistory
