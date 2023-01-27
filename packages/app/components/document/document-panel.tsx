import { useEffect, useState } from 'react'
import { MdClose } from 'react-icons/md'
import { Rnd } from 'react-rnd'
import IconButton from '../icon-button'
import styles from './document-panel.module.css'

const DEFAULT_DIMENSIONS = {
    x: 1300,
    y: -130,
    width: 450,
    height: 800,
}

const DocumentPanel = ({ title, children, onClose, open = false, large = false }) => {
    const [showRnd, setShowRnd] = useState(false)
    const [defaultDimensions, setDefaultDimensions] = useState(null)

    useEffect(() => {
        setDefaultDimensions({
            ...DEFAULT_DIMENSIONS,
            ...(typeof window !== undefined && {
                x: window.innerWidth - DEFAULT_DIMENSIONS.width - 30,
            }),
        })
    }, [])

    useEffect(() => {
        if (open) {
            setShowRnd(true)
        } else {
            setTimeout(() => {
                setShowRnd(false)
            }, 100)
        }
    }, [open])

    if (!defaultDimensions) {
        // render an empty div until we have the default dimensions for the panel
        return <div />
    }

    return (
        <Rnd
            default={defaultDimensions}
            disableDragging
            minHeight="100vh"
            maxHeight="100vh"
            style={{ visibility: showRnd ? 'visible' : 'hidden', position: 'fixed' }}
        >
            <div
                className={`${styles.panel} ${open ? styles.panelOpen : ''} ${
                    large ? styles.panelLarge : ''
                }`}
            >
                <h3>{title}</h3>

                {open && children}

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
