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

/**
 * mEditor previously used hashes for routes, but hashes aren't passed into the server, so now it's using normal URLs.
 * Because old URLs may be bookmarked, let's redirect the old URLs to the new URLs
 */
const OLD_URL_MAPPING = {
    '#/search?': { href: '/meditor/[modelName]', as: '/meditor/{model}' },
    '#/document/edit?': {
        href: '/meditor/[modelName]/[documentTitle]',
        as: '/meditor/{model}/{title}',
    },
    '#/document/new?': {
        href: '/meditor/[modelName]/new',
        as: '/meditor/{model}/new',
    },
}

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

function getOldUrlMapping() {
    if (typeof window === 'undefined' || !window.location.hash) return

    const oldUrlKey = Object.keys(OLD_URL_MAPPING).find(prefix =>
        window.location.hash.includes(prefix)
    )

    return oldUrlKey ? OLD_URL_MAPPING[oldUrlKey] : undefined
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
    let canLoadPage =
        typeof user !== 'undefined' ||
        router.pathname == '/' ||
        router.pathname == '/installation'

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
            .map(v => v.split('='))
            .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {})

        let newUrl = oldUrlMapping

        Object.keys(hashObj).forEach(
            key => (newUrl.as = newUrl.as.replace(`{${key}}`, hashObj[key]))
        )

        console.log('using an old URL, redirect to new URL: ', JSON.stringify(newUrl))

        router.push(newUrl.href, newUrl.as)
    }

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
                <meta
                    property="og:url"
                    content="https://lb.gesdisc.eosdis.nasa.gov/meditor"
                />

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
                <Layout>
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
                </Layout>
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
