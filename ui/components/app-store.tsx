import { createContext, useState } from 'react'

export interface Notification {
    message: String
    type?: 'ok' | 'error'
}

const DEFAULTS = {
    user: null,
    setUser: (_user: any) => {},
    notification: null,
    setNotification: (_notification: Notification) => {},
    setSuccessNotification: (_message: String) => {},
    setErrorNotification: (_message: String) => {},
}

export const AppContext = createContext(DEFAULTS)

const AppStore = props => {
    const [user, setUser] = useState<any>(null)
    const [notification, setNotification] = useState<Notification>(null)

    function setSuccessNotification(message) {
        setNotification({ message, type: 'ok' })
    }

    function setErrorNotification(message) {
        setNotification({ message, type: 'error' })
    }

    const store = {
        user,
        setUser,
        notification,
        setNotification,
        setSuccessNotification,
        setErrorNotification,
    }

    return <AppContext.Provider value={store}>{props.children}</AppContext.Provider>
}

export default AppStore
