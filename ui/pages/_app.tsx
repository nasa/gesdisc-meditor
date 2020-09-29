import Head from 'next/head'
import Header from '../components/header'
import AppStore from '../components/app-store'
import Toast from '../components/toast'
import UserAuthentication from '../components/user-authentication'
import '../styles.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { applyPolyfills, defineCustomElements } from '@gesdisc/meditor-components/loader'

let customElementsRegistered = false

function registerCustomElements() {
    if (customElementsRegistered || typeof window == 'undefined') {
        return
    }

    customElementsRegistered = true

    applyPolyfills().then(() => {
        defineCustomElements(window)
    })
}

/**
 * mEditor previously used hashes for routes, but hashes aren't passed into the server, so now it's using normal URLs.
 * Because old URLs may be bookmarked, let's redirect the old URLs to the new URLs
 */
const OLD_URL_MAPPING = {
    '#/search?': { href: '/meditor/[modelName]', as: '/meditor/{model}' },
    '#/document/edit?': { href: '/meditor/[modelName]/[documentTitle]', as: '/meditor/{model}/{title}' },
    '#/document/new?': { href: '/meditor/[modelName]/new', as: '/meditor/{model}/new' },
}

function getOldUrlMapping() {
    if (typeof window === 'undefined' || !window.location.hash) return

    const oldUrlKey = Object.keys(OLD_URL_MAPPING).find((prefix) => window.location.hash.includes(prefix))

    return oldUrlKey ? OLD_URL_MAPPING[oldUrlKey] : undefined
}

/**
 * customize the App to provide a consistent layout across pages
 * @param props.Component the active page
 * @param props.pageProps if page is using getInitialProps, pageProps will contain those
 */
const App = ({ Component, pageProps }) => {
    const [user, setUser] = useState()
    const router = useRouter()

    const isAuthenticated = typeof user !== 'undefined' && user != null
    const useLayout = router.pathname != '/installation'
    let canLoadPage = typeof user !== 'undefined' || router.pathname == '/' || router.pathname == '/installation'

    useEffect(() => {
        registerCustomElements()
    }, [])

    const oldUrlMapping = getOldUrlMapping()

    // handle old URLs, use the mapping to construct the new URL
    // TODO: use mEditor logs to determine if old URLs are still be used, if not, remove this
    if (oldUrlMapping) {
        canLoadPage = false

        const hashObj: any = window.location.hash
            .split('?')[1]
            .split('&')
            .map((v) => v.split('='))
            .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {})

        let newUrl = oldUrlMapping

        Object.keys(hashObj).forEach((key) => (newUrl.as = newUrl.as.replace(`{${key}}`, hashObj[key])))

        console.log('using an old URL, redirect to new URL: ', JSON.stringify(newUrl))

        router.push(newUrl.href, newUrl.as)
    }

    return (
        <>
            <Head>
                <meta name="description" content="Model Editor" />
                <meta property="og:type" content="website" />
                <meta name="og:title" property="og:title" content="mEditor" />
                <meta name="og:description" property="og:description" content="Model Editor" />
                <meta property="og:site_name" content="mEditor" />
                <meta property="og:url" content="https://lb.gesdisc.eosdis.nasa.gov/meditor" />

                <link rel="icon" type="image/x-icon" href="/meditor/favicon.ico" />

                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" />
            </Head>

            <Header user={user} isAuthenticated={isAuthenticated} />

            <AppStore>
                {!useLayout && canLoadPage && (
                    <Component {...pageProps} user={user} isAuthenticated={isAuthenticated} />
                )}

                {useLayout && (
                    <div className="container-fluid">
                        <section className="page-container shadow-sm">
                            {canLoadPage ? (
                                <Component {...pageProps} user={user} isAuthenticated={isAuthenticated} />
                            ) : (
                                <></>
                            )}
                        </section>
                    </div>
                )}

                {router.pathname !== '/installation' && (
                    <UserAuthentication onUserUpdate={setUser} user={user} isAuthenticated={isAuthenticated} />
                )}
                <Toast />
            </AppStore>
        </>
    )
}


export default App
