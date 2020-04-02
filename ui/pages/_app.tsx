import Head from 'next/head'
import Header from '../components/header'
import AppStore from '../components/app-store'
import '../styles.css'

/**
 * customize the App to provide a consistent layout across pages
 * @param props.Component the active page
 * @param props.pageProps if page is using getInitialProps, pageProps will contain those
 */
const App = ({ Component, pageProps }) => {
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

            <Header />

            <div className="container-fluid">
                <section className="page-container">
                    <AppStore>
                        <Component {...pageProps} />
                    </AppStore>
                </section>
            </div>
        </>
    )
}

export default App
