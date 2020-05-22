import Badge from 'react-bootstrap/Badge'
import styles from './document-state-badge.module.css'

const DocumentStateBadge = ({ document }) => {
    return (
        <Badge pill className={styles.badge}>
            {document?.state}
        </Badge>
    )
}

export default DocumentStateBadge
