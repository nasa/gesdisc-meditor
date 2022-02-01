import styles from 'bootstrap/dist/css/bootstrap.min.css'
import type { LinksFunction, MetaFunction } from 'remix'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from 'remix'
import { Header, links as headerLinks } from '~/components/header'

export const meta: MetaFunction = () => {
    return { title: 'mEditor | Documentation' }
}

export const links: LinksFunction = () => {
    return [
        ...headerLinks(),
        {
            rel: 'stylesheet',
            href: styles,
        },
    ]
}

export default function App() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <Header />
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                {process.env.NODE_ENV === 'development' && <LiveReload />}
            </body>
        </html>
    )
}
