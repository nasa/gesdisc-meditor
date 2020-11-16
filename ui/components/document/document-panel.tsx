import styles from './document-panel.module.css'
import IconButton from '../icon-button'
import { MdClose } from 'react-icons/md'

const DocumentPanel = ({ title, children, onClose, open = false, large = false }) => {
    return (
        <div className={`${styles.panel} ${open ? styles.panelOpen : ''} ${large ? styles.panelLarge : ''}`}>
            <h3>{title}</h3>
        
            {children}

            <div className={styles.close}>
                <IconButton alt="Close" tooltipPlacement="left">
                    <MdClose onClick={onClose} />
                </IconButton>
            </div>
        </div>
    )
}

export default DocumentPanel
