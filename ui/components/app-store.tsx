import { createContext, useState } from 'react'

export interface Notification {
    message: String
    type?: 'ok' | 'error'
}

const DEFAULTS = {
    notification: null,
    setNotification: (_notification: Notification) => {},
    setSuccessNotification: (_message: String) => {},
    setErrorNotification: (_message: String) => {},
}

export const AppContext = createContext(DEFAULTS)

export default props => {
    const [notification, setNotification] = useState<Notification>(null)

    function setSuccessNotification(message) {
        setNotification({ message, type: 'ok' })
    }

    function setErrorNotification(message) {
        setNotification({ message, type: 'error' })
    }

    const store = {
        notification,
        setNotification,
        setSuccessNotification,
        setErrorNotification,
    }

    return <AppContext.Provider value={store}>{props.children}</AppContext.Provider>
}
