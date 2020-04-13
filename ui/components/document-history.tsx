import Card from 'react-bootstrap/Card'
import DocumentStateBadge from './document-state-badge'
import styles from './document-history.module.css'

const DocumentHistory = ({ history = [], onVersionChange }) => {
    return (
        <div>
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
                    </Card.Body>
                </Card>
            ))}
        </div>
    )
}

export default DocumentHistory
