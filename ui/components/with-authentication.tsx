import { useContext } from 'react'
import { AppContext } from './app-store'
import Router, { useRouter } from 'next/router'
import mEditorAPI from '../service/'

/**
 * if a page is wrapped in withAuthentication, this will handle a few cases:
 *  1) if the user is not authenticated, redirect to the dashboard
 *  2) if the user is authenticated, go ahead and render the page
 * @param WrappedComponent 
 */
const withAuthentication = WrappedComponent => props => {
    const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(AppContext)
    const router = useRouter()

    console.log('router path is ', router)

    console.log('in a protected route ', props)

    console.log('in here with ', user, isAuthenticated)

    async function getUser() {
        try {
            setUser(await mEditorAPI.getMe())
            setIsAuthenticated(true)
            console.log('sucess!')
        } catch (err) {
            console.log('failed to get user')
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    if (isAuthenticated === null) {
        console.log('is authenticated is null, get user')
        getUser()
        return <></>
    }

    if (user || router.pathname === '/') {
        console.log('approved! relae the page')
        return <WrappedComponent {...props} user={user} />
    }

    if (isAuthenticated === false && typeof window !== 'undefined') {
        console.log('redirecting to dashboard, user is not authenticated!')
        Router.push({
            pathname: '/',
            query: {
                redirectHref: router.pathname,
                redirectAs: router.asPath,
            }
        })
    }

    return <></>
}

export default withAuthentication
