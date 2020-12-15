import Router from 'next/router'

const REDIRECT_URL_KEY = 'redirectUrl'

const LoginPage = ({ user }) => {
    let redirectUrl: any = localStorage.getItem(REDIRECT_URL_KEY)
    
    // remove redirect url so future logins aren't redirected
    localStorage.removeItem(REDIRECT_URL_KEY)

    try {
        if (!user || !redirectUrl) {
            throw new Error()
        }

        redirectUrl = JSON.parse(redirectUrl)

        // don't follow redirects for installation page
        if (redirectUrl.as == '/meditor/installation') {
            throw new Error()
        }

        // go back to the URL the user tried to access before logging in
        Router.push(redirectUrl.href, redirectUrl.as)
    } catch (err) {
        // go to the dashboard, we either don't have a logged in user or don't know where to send them
        Router.push('/meditor')
    }

    return <></>
}

export default LoginPage
