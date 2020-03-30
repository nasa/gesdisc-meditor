import { createContext, useState, useEffect } from 'react'

export const AppContext = createContext(null)

export default (props) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortDir, setSortDir] = useState('desc')
    const [filterBy, setFilterBy] = useState('')

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
