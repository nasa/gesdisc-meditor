import { createContext, useState } from 'react'

const DEFAULTS = {
    searchTerm: '',
    setSearchTerm: (_searchTerm: string) => {},
    sortDir: 'desc',
    setSortDir: (_sortDir: 'asc' | 'desc') => {},
    filterBy: '',
    setFilterBy: (_filterBy: string) => {}
}

export const AppContext = createContext(DEFAULTS)

export default (props) => {
    const [searchTerm, setSearchTerm] = useState<string>(DEFAULTS.searchTerm)
    const [sortDir, setSortDir] = useState<string>(DEFAULTS.sortDir)
    const [filterBy, setFilterBy] = useState<string>(DEFAULTS.filterBy)

    const store = {
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
