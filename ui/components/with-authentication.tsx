import { useRouter } from 'next/router'

/**
 * restricts a page from loading if the user isn't authenticated
 * @param WrappedComponent 
 */
const withAuthentication = WrappedComponent => props => {
    const router = useRouter()

    // if a user is logged in or the current page is the dashboard, show the requested page
    if (props.isAuthenticated || router.pathname === '/') {
        return <WrappedComponent {...props} user={props.user} />
    }

    return <></>
}

export default withAuthentication
