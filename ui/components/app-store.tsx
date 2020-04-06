import { createContext, useState } from 'react'

interface Notification {
    message: String
    type?: 'ok' | 'error'
}

const DEFAULTS = {
    notification: null,
    setNotification: (_notification: Notification) => {},
    setSuccessNotification: (_message: String) => {},
    setErrorNotification: (_message: String) => {},
    searchTerm: '',
    setSearchTerm: (_searchTerm: string) => {},
    sortDir: 'desc',
    setSortDir: (_sortDir: 'asc' | 'desc') => {},
    filterBy: '',
    setFilterBy: (_filterBy: string) => {}
}

export const AppContext = createContext(DEFAULTS)

export default (props) => {
    const [notification, setNotification] = useState<Notification>(null)
    const [searchTerm, setSearchTerm] = useState<string>(DEFAULTS.searchTerm)
    const [sortDir, setSortDir] = useState<string>(DEFAULTS.sortDir)
    const [filterBy, setFilterBy] = useState<string>(DEFAULTS.filterBy)

    const store = {
        notification,
        setNotification,
        setSuccessNotification: (message) => setNotification({
            message,
            type: 'ok',
        }),
        setErrorNotification: (message) => setNotification({
            message,
            type: 'error',
        }),
        searchTerm,
        setSearchTerm,
        sortDir,
        setSortDir,
        filterBy,
        setFilterBy,
    }

    return (
        <AppContext.Provider value={store}>
            {props.children}
        </AppContext.Provider>
    )
}
