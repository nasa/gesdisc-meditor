import styles from './document-panel.module.css'
import IconButton from '../icon-button'
import { MdClose } from 'react-icons/md'
import { Rnd } from 'react-rnd'
import { useState, useEffect } from 'react'


const DocumentPanel = ({ title, children, onClose, open = false, large = false }) => {
    const [showRnd , setShowRnd] = useState(false)
    
    console.log("open ", open)
    console.log("showRnd ", showRnd)
    useEffect (() => {
        if(open) {
            setShowRnd(true)
        }else {
            setShowRnd(false)
        }
    },[open])

    //if(showRnd) style.display = "none"
    //style={showRnd ? null : { display: "none"}}

    return (
        <Rnd 
        default={{
        x: 1030,
        y: -130,
        width: 430,
        height: 800 ,
      }}
      disableDragging
      style={{display: showRnd ? "block" : "none"}}
     // show={showRnd}
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
