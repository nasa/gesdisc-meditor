import type { LinksFunction } from 'remix'
import { links as scrollToTopLinks, ScrollToTop } from '~/components/scroll-to-top'
import {
    links as tableOfContentsLinks,
    TableOfContents,
} from '~/components/table-of-contents'
import Introduction from '~/documentation/user-guide/introduction.mdx'
import QuickStart from '~/documentation/user-guide/quick-start.mdx'
import UsingComments from '~/documentation/user-guide/using-comments.mdx'
import VersionsAndHistory from '~/documentation/user-guide/versions-and-history.mdx'
import WorkflowsAndRoles from '~/documentation/user-guide/workflows-and-roles.mdx'
import WorkingWithDocuments from '~/documentation/user-guide/working-with-documents.mdx'
import styles from '~/styles/user-guide.css'

export const links: LinksFunction = () => {
    return [
        ...tableOfContentsLinks(),
        ...scrollToTopLinks(),
        { rel: 'stylesheet', href: styles },
    ]
}

export default function UserGuide() {
    return (
        <main className="user-guide px-5 container">
            <ScrollToTop />
            <Introduction />
            <TableOfContents includeHeadings={['h2', 'h3']}>
                <article>
                    <QuickStart />
                </article>
                <article>
                    <WorkingWithDocuments />
                </article>
                <article>
                    <WorkflowsAndRoles />
                </article>
                <article>
                    <UsingComments />
                </article>
                <article>
                    <VersionsAndHistory />
                </article>
            </TableOfContents>
        </main>
    )
}
