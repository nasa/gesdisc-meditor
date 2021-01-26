import styles from './document-panel.module.css'
import IconButton from '../icon-button'
import { MdClose } from 'react-icons/md'
import { Rnd } from 'react-rnd'
import { callbackify } from 'util'


const DocumentPanel = ({ title, children, onClose, open = false, large = false }) => {

    return (
      
     <Rnd default={{
        x: 0,
        y: 0,
        width: 400,
        height: 700,
      }}>
        <div className={`${styles.panel} ${open ? styles.panelOpen : ''} ${large ? styles.panelLarge : ''}`}>
          
            <h3>{title}</h3>
        
            {children}

            <div className={styles.close}>
                <IconButton alt="Close" tooltipPlacement="left">
                    <MdClose onClick={onClose} />
                </IconButton>
            </div>
           
        </div> 
     </Rnd>
    )
}

export default DocumentPanel
