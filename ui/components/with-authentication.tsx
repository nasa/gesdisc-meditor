import App from 'next/app'
import { useRouter } from 'next/router'

/**
 * restricts a page from loading if the user isn't authenticated
 */
export const withAuthentication =
    ({ ssr = false } = {}) =>
    PageComponent => {
        // create the actual component
        const WithAuthentication = props => {
            const router = useRouter()

            // if a user is logged in or the current page is the dashboard, show the requested page
            if (props.isAuthenticated || router.pathname === '/') {
                return <PageComponent {...props} user={props.user} />
            }

            return <></>
        }

        if (ssr || PageComponent.getInitialProps) {
            WithAuthentication.getInitialProps = async ctx => {
                const inAppContext = Boolean(ctx.ctx)

                // Run wrapped getInitialProps methods
                let pageProps = {}

                if (PageComponent.getInitialProps) {
                    pageProps = await PageComponent.getInitialProps(ctx)
                } else if (inAppContext) {
                    pageProps = await App.getInitialProps(ctx)
                }

                // Only on the server:
                if (typeof window === 'undefined') {
                    const { AppTree } = ctx
                    // When redirecting, the response is finished.
                    // No point in continuing to render
                    if (ctx.res && ctx.res.finished) {
                        return pageProps
                    }
                }

                return {
                    ...pageProps,
                }
            }
        }

        return WithAuthentication
    }

export default withAuthentication
