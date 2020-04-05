import Head from 'next/head'
import Header from '../components/header'
import AppStore from '../components/app-store'
import UserAuthentication from '../components/user-authentication'
import '../styles.css'
import { useState } from 'react'
import { useRouter } from 'next/router'

/**
 * customize the App to provide a consistent layout across pages
 * @param props.Component the active page
 * @param props.pageProps if page is using getInitialProps, pageProps will contain those
 */
const App = ({ Component, pageProps }) => {
    const [ user, setUser ] = useState()
    const router = useRouter()

    const isAuthenticated = typeof user !== 'undefined' && user != null
    const canLoadPage = typeof user !== 'undefined' || router.pathname == '/'
   
    return (
        <>
            <Head>
                <meta name="description" content="Model Editor" />
                <meta property="og:type" content="website" />
                <meta name="og:title" property="og:title" content="mEditor" />
                <meta name="og:description" property="og:description" content="Model Editor" />
                <meta property="og:site_name" content="mEditor" />
                <meta property="og:url" content="https://lb.gesdisc.eosdis.nasa.gov/meditor" />
            </Head>

            <Header user={user} isAuthenticated={isAuthenticated} />

            <AppStore>
                <div className="container-fluid">
                    <section className="page-container">
                        {canLoadPage ? (
                            <Component {...pageProps} user={user} isAuthenticated={isAuthenticated} />
                        ) : (
                            <></>
                        )}
                    </section>
                </div>

                <UserAuthentication onUserUpdate={setUser} user={user} isAuthenticated={isAuthenticated} />
            </AppStore>
        </>
    )
}

export default App
