import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { FaRegDotCircle } from 'react-icons/fa'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { useLocalStorage } from '../../lib/use-localstorage.hook'
import styles from './document-history.module.css'
import DocumentStateBadge from './document-state-badge'

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
    showJSONView,
}) => {
    const [historyPreferences, setHistoryPreferences] = useLocalStorage(
        'historyPreferences',
        {
            showDetails: false,
        }
    )

    const toggleShowDetails = () => {
        setHistoryPreferences({
            ...historyPreferences,
            showDetails: !historyPreferences.showDetails,
        })
    }

    function toggleActiveHistory(ev) {
        document
            .querySelectorAll('div[class^="document-history_card"]')
            .forEach(item => {
                item.classList.remove(`${styles.activeHistory}`)
            })

        ev.target.closest('.card').classList.add(`${styles.activeHistory}`)
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

            {history === null ? (
                <p className="text-center py-4 text-danger">
                    mEditor had an error getting the history for this document.
                    mEditor has recorded the error, but you can still leave feedback
                    using the link at the top of the page.
                </p>
            ) : (
                history.map((item, index) => (
                    <Card
                        key={item.modifiedOn}
                        className={`${styles.card} ${
                            index === 0 ? styles.activeHistory : ''
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
                                                key={state.source + state.modifiedOn}
                                            />
                                        ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                ))
            )}
        </div>
    )
}

export default DocumentHistory
