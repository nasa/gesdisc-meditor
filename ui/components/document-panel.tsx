import styles from './document-panel.module.css'
import { MdClose } from 'react-icons/md'

const DocumentPanel = ({ title, children, onClose, open = false }) => {
    return (
        <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>
            <h3>{title}</h3>
        
            {children}

            <MdClose className={styles.close} onClick={onClose} />
        </div>
    )
}

export default DocumentPanel
