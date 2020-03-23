import Header from '../components/header'
import '../styles.css'

/**
 * customize the App to provide a consistent layout across pages
 * @param props.Component the active page
 * @param props.pageProps if page is using getInitialProps, pageProps will contain those
 */
const App = ({ Component, pageProps }) => {
    return (
        <>
            <Header />

            <div className="container-fluid">
                <section className="page-container">
                    <Component {...pageProps} />
                </section>
            </div>
        </>
    )
}

export default App
