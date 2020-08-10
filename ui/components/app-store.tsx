import { createContext, useState } from 'react'

export interface Notification {
    message: String
    type?: 'ok' | 'error'
}

export interface SearchOptions {
    term: string
    filters: any
    sort: SortOptions
}

export interface SortOptions {
    direction: string
    property: string
    isDate: boolean
}

const DEFAULTS = {
    user: null,
    setUser: (_user: any) => {},
    notification: null,
    setNotification: (_notification: Notification) => {},
    setSuccessNotification: (_message: String) => {},
    setErrorNotification: (_message: String) => {},

    // Why are search options in the app store? So that a user doesn't lose their search options between page changes
    searchOptions: {
        term: '',
        filters: {
            state: '',
        },
        sort: {
            direction: 'desc',
            property: 'modifiedOn',
            isDate: true,
        }
    },
}

export const AppContext = createContext(DEFAULTS)

export default (props) => {
    const [user, setUser] = useState<any>(null)
    const [notification, setNotification] = useState<Notification>(null)
    const [searchOptions, setSearchOptions] = useState<SearchOptions>(DEFAULTS.searchOptions)

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
        searchOptions,
        setSearchOptions,
    }

    return (
        <AppContext.Provider value={store}>
            {props.children}
        </AppContext.Provider>
    )
}
