import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useLocalStorage } from '../lib/use-localstorage.hook'

const REDIRECT_URL_KEY = 'redirectUrl'

const LoginPage = ({ user }) => {
    const router = useRouter()
    const [redirectUrl, _setRedirectUrl] = useLocalStorage(REDIRECT_URL_KEY, null)

    useEffect(() => {
        localStorage.removeItem(REDIRECT_URL_KEY) // remove redirect url so future logins aren't redirected

        redirectToUrl(redirectUrl)
    }, [redirectUrl])

    function redirectToUrl(redirectUrl: { href: string; as: string }) {
        try {
            if (!user || !redirectUrl) {
                throw new Error()
            }

            // don't follow redirects for installation page
            if (redirectUrl.as == '/installation') {
                throw new Error()
            }

            // go back to the URL the user tried to access before logging in
            router.push(redirectUrl.href, redirectUrl.as)
        } catch (err) {
            // go to the dashboard, we either don't have a logged in user or don't know where to send them
            router?.push('/')
        }
    }

    return <></>
}

export default LoginPage
