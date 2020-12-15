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
                <div><em>{state.modifiedBy} on {state.modifiedOn}</em></div>
            </div>
        </div>
    </div>
)

const DocumentHistory = ({ history = [], onVersionChange }) => {
    const [historyPreferences, setHistoryPreferences] = useLocalStorage('historyPreferences', {
        showDetails: false,
    })

    const toggleShowDetails = () => {
        setHistoryPreferences({
            ...historyPreferences,
            showDetails: !historyPreferences.showDetails,
        })
    }
    
    return (
        <div>
            <div className={styles.buttons}>
                <Button className={styles.button} variant="outline-dark" onClick={toggleShowDetails}>
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
            </div>

            {history.map((item) => (
                <Card key={item.modifiedOn} className={styles.card} onClick={() => onVersionChange(item.modifiedOn)}>
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

                        {item.states?.length > 0 && 
                            <div className={`${styles.pastStates} ${historyPreferences.showDetails ? styles.visible : ''}`}>
                                {item.states?.sort(sortByLastModifiedDesc).map(state => <PastState state={state} key={state.source + state.modifiiedOn} />)}
                            </div>
                        }
                    </Card.Body>
                </Card>
            ))}
        </div>
    )
}

export default DocumentHistory
