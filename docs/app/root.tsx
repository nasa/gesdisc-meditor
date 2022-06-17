import bootstrap from 'bootstrap/dist/css/bootstrap.min.css'
import type { LinksFunction, LoaderFunction } from 'remix'
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from 'remix'
import { Header, links as headerLinks } from '~/components/header'
import styles from '~/styles/shared.css'

export const links: LinksFunction = () => {
    return [
        { rel: 'icon', href: '/meditor/docs/favicon.ico', type: 'image/x-icon' },
        {
            rel: 'stylesheet',
            href: bootstrap,
        },
        {
            rel: 'stylesheet',
            href: styles,
        },
        ...headerLinks(),
    ]
}

export const loader: LoaderFunction = async ({ request }) => {
    const data = {
        ENV: {
            HELP_DOCUMENT_LOCATION:
                process.env.HELP_DOCUMENT_LOCATION || '/meditor/docs/user-guide',
        },
        firstName: null,
    }

    try {
        const response = await fetch(`${process.env.API_ORIGIN}/meditor/api/me`, {
            //* Pass through the authentication cookie from the initial request to load the page.
            //? Not sure why "credentials: 'include'" does not work here.
            headers: {
                Cookie: request.headers.get('Cookie') || '',
            },
        })

        if (response.ok) {
            const { firstName } = await response.json()

            data.firstName = firstName
        }
    } catch (error) {
        console.error(error)
    } finally {
        return data
    }
}

export default function App() {
    const { ENV, firstName } = useLoaderData()

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <Header docsUrl={ENV.HELP_DOCUMENT_LOCATION} firstName={firstName} />
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                {process.env.NODE_ENV === 'development' && <LiveReload />}
            </body>
        </html>
    )
}
