import Badge from 'react-bootstrap/Badge'
import styles from './state-badge.module.css'

const StateBadge = ({ variant = '', children }) => {
    return (
        <Badge
            pill
            className={`${styles.badge} ${variant ? styles['badge-' + variant] : ''}`}
        >
            {children}
        </Badge>
    )
}

export default StateBadge
