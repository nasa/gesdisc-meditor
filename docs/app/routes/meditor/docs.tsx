import type { LinksFunction } from 'remix'
import { Outlet } from 'remix'
import { links as scrollToTopLinks, ScrollToTop } from '~/components/scroll-to-top'
import styles from '~/styles/docs.css'

export const links: LinksFunction = () => {
    return [...scrollToTopLinks(), { rel: 'stylesheet', href: styles }]
}

export default function DocsLayout() {
    return (
        <main className="docs px-5 container">
            <ScrollToTop />
            <Outlet />
        </main>
    )
}
