import { createContext, useState, useEffect } from 'react'
import mEditorAPI from '../service/'

const DEFAULTS = {
    user: null,
    setUser: (_user: any) => {},
    isAuthenticated: null,
    setIsAuthenticated: (_isAuthenticated: boolean) => {},
    searchTerm: '',
    setSearchTerm: (_searchTerm: string) => {},
    sortDir: 'desc',
    setSortDir: (_sortDir: 'asc' | 'desc') => {},
    filterBy: '',
    setFilterBy: (_filterBy: string) => {}
}

export const AppContext = createContext(DEFAULTS)

export default (props) => {
    const [user, setUser] = useState<any>(DEFAULTS.user)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(DEFAULTS.isAuthenticated)
    const [searchTerm, setSearchTerm] = useState<string>(DEFAULTS.searchTerm)
    const [sortDir, setSortDir] = useState<string>(DEFAULTS.sortDir)
    const [filterBy, setFilterBy] = useState<string>(DEFAULTS.filterBy)

    const store = {
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        searchTerm,
        setSearchTerm,
        sortDir,
        setSortDir,
        filterBy,
        setFilterBy,
    }

    async function fetchUser() {
        console.log('fetch user')
        
        try {
            let user = await mEditorAPI.getMe()

            console.log('user is ', user)

            setUser(user)
            setIsAuthenticated(true)
        } catch (err) {
            console.log('failed to fetch user')
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    /* 
    useEffect(() => {
        console.log('ok in use effect')
        fetchUser()
    }, [])*/

    return (
        <AppContext.Provider value={store}>
            {props.children}
        </AppContext.Provider>
    )
}
