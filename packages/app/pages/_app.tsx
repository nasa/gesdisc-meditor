import type { AppContext, AppProps } from 'next/app'
import NextApp from 'next/app'
import {
    applyPolyfills,
    defineCustomElements,
} from '@gesdisc/meditor-components/loader'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AppStore from '../components/app-store'
import Header from '../components/header'
import Layout from '../components/layout'
import Toast from '../components/toast'
import UserAuthentication from '../components/user-authentication'
import '../styles.css'

type PropsType = {
    theme: Theme
}

type Theme = typeof THEMES[number]

// https://www.rfc-editor.org/rfc/rfc7230#section-2.7.3
// Though the URI spec says the query string is case-sensitive, we'll normalize as lowercase to follow https://lawsofux.com/postels-law/
const THEMES = ['default', 'edpub'] as const

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
 * customize the App to provide a consistent layout across pages
 * @param props.Component the active page
 * @param props.pageProps if page is using getInitialProps, pageProps will contain those
 */
const App = ({ Component, pageProps, theme }: AppProps & PropsType) => {
    const [user, setUser] = useState()
    const router = useRouter()
    const isAuthenticated = typeof user !== 'undefined' && user != null
    const canLoadPage =
        typeof user !== 'undefined' ||
        router.pathname == '/' ||
        router.pathname == '/installation'

    useEffect(() => {
        registerCustomElements()
    }, [])

    return (
        <>
            <Head>
                <meta name="description" content="Model Editor" />
                <meta property="og:type" content="website" />
                <meta name="og:title" property="og:title" content="mEditor" />
                <meta
                    name="og:description"
                    property="og:description"
                    content="Model Editor"
                />
                <meta property="og:site_name" content="mEditor" />
                <meta property="og:url" content="/meditor" />

                <link rel="icon" type="image/x-icon" href="/meditor/favicon.ico" />

                <link
                    rel="stylesheet"
                    href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
                />
            </Head>

            <AppStore>
                {theme !== 'edpub' && (
                    <Header user={user} isAuthenticated={isAuthenticated} />
                )}
                {canLoadPage ? (
                    <Component
                        {...pageProps}
                        isAuthenticated={isAuthenticated}
                        theme={theme}
                        user={user}
                    />
                ) : (
                    <></>
                )}

                {/* todo: consider making this composable, returning children or login prompt? */}
                {router.pathname !== '/installation' && (
                    <UserAuthentication
                        isAuthenticated={isAuthenticated}
                        onUserUpdate={setUser}
                        user={user}
                    />
                )}
                <Toast />
            </AppStore>
        </>
    )
}

// will return 'default' or a valid theme
function resolveTheme(
    param: string | string[],
    allowedUrlTheme: Theme = 'default',
    envTheme: Theme = 'default'
): PropsType['theme'] {
    // Get the value of the theme search param or the last value of multiple theme search params.
    const urlThemeCandidate = Array.isArray(param)
        ? param[param.length - 1]?.toLowerCase()
        : param?.toLowerCase()

    const themeCandidate =
        urlThemeCandidate === allowedUrlTheme.toLowerCase()
            ? (urlThemeCandidate as Theme)
            : envTheme.toLowerCase()

    return THEMES.includes(themeCandidate as Theme)
        ? (themeCandidate as Theme)
        : 'default'
}

App.getInitialProps = async (context: AppContext) => {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await NextApp.getInitialProps(context)

    const {
        router: { query },
    } = context

    // It is possible that this value will be a string that is not in THEME.
    const theme = resolveTheme(
        query.theme,
        process.env.UI_ALLOWED_URL_THEME as Theme,
        process.env.UI_THEME as Theme
    )

    return { ...appProps, theme }
}

export default App
