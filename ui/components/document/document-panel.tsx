import styles from './document-panel.module.css'
import IconButton from '../icon-button'
import { MdClose } from 'react-icons/md'
import { useState, useEffect } from 'react'
import ResizablePanels from '../resizepanel.js'
//import { Rnd } from 'react-rnd'

const DocumentPanel = ({ title, children, onClose, open = false, large = false }) => {
    
    const [separatorXPosition, setSeparatorXPosition] = useState<undefined | number>(undefined);
    const [dragging, setDragging] = useState(false)
    const [leftWidth, setLeftWidth] = useState<undefined | number>(undefined);
    const MIN_WIDTH = 80;

    const onMouseDown = (e: React.MouseEvent) => {
        setSeparatorXPosition(e.clientX);
        setDragging(true);
      };

      const onMouseMove = (e) => {
        if (dragging && leftWidth && separatorXPosition) {
          const newLeftWidth = leftWidth + e.clientX - separatorXPosition;
          setSeparatorXPosition(e.clientX);

          if (newLeftWidth < MIN_WIDTH) {
            setLeftWidth(MIN_WIDTH);
            return;
          }
    
          setLeftWidth(newLeftWidth);
        }
      };

      const onMouseUp = () => {
        setDragging(false);
      };

      useEffect(() => {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    
        return () => {
         document.removeEventListener('mousemove', onMouseMove);
         document.removeEventListener('mouseup', onMouseUp);
        };
      });

    return (
       //<ResizablePanels>

        <div className={`${styles.panel} ${open ? styles.panelOpen : ''} ${large ? styles.panelLarge : ''}`}>
           
            <h3>{title}</h3>
        
            {children}

            <div className={styles.close}>
                <IconButton alt="Close" tooltipPlacement="left">
                    <MdClose onClick={onClose} />
                </IconButton>
            </div>
        </div> 
      
     
     //</ResizablePanels>
    
    )
}

export default DocumentPanel
