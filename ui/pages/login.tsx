import Router from 'next/router'
import mEditorAPI from '../service/'

const LoginPage = ({ user }) => {
    let redirectUrl: any = localStorage.getItem('redirectUrl')

    if (user && redirectUrl) {
        // go back to the URL the user tried to access before logging in
        redirectUrl = JSON.parse(redirectUrl)
        Router.push(redirectUrl.href, redirectUrl.as)
    } else {
        // go to the dashboard, we either don't have a logged in user or don't know where to send them
        Router.push('/')
    }

    return <></>
}

export async function getServerSideProps(context) {
    let props = { user: null }

    try {
        props.user = await mEditorAPI.getMe()
    } catch (err) {}

    return { props }
}

export default LoginPage
