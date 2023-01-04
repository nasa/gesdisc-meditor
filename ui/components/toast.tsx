import { useState, useContext, useEffect } from 'react'
import { AppContext } from './app-store'
import { default as BSToast } from 'react-bootstrap/Toast'
import styles from './toast.module.css'

const Toast = () => {
    const [show, setShow] = useState(false)
    let { notification, setNotification } = useContext(AppContext)

    useEffect(() => {
        setShow(notification?.message ? true : false)
    }, [notification])

    function hideNotification() {
        // give the animation a bit to finish, then remove
        setTimeout(() => setNotification(null), 200)
    }

    return (
        <BSToast
            onClose={hideNotification}
            show={show}
            className={styles.toast}
            style={{
                border: 'none',
                boxShadow: 'none',
                overflow: 'visible',
            }}
            delay={3000}
            autohide
        >
            <BSToast.Body className={`${styles.body} ${styles[notification?.type]}`}>
                {notification?.message}

                <button
                    type="button"
                    className={`close ml-2 mb-1 ${styles.dismissButton}`}
                    onClick={hideNotification}
                >
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">Close</span>
                </button>
            </BSToast.Body>
        </BSToast>
    )
}

export default Toast
