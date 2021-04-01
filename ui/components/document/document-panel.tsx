import styles from './document-panel.module.css'
import IconButton from '../icon-button'
import { MdClose } from 'react-icons/md'
import { Rnd } from 'react-rnd'


const DocumentPanel = ({ title, children, onClose, open = false, large = false }) => {
    return (
        <Rnd 
        default={{
        x: 1030,
        y: -130,
        width: 430,
        height: 800 ,
      }}
      disableDragging
      //style={{display: "show" && "none"}}
      >
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
