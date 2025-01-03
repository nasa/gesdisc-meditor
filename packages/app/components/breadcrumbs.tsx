import Link from 'next/link'
import styles from './breadcrumbs.module.css'
import type { PropsWithChildren } from 'react'

type BreadcrumbProps = {
    title: string
    href?: string
    as?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ title, href, as }) => {
    return (
        <li className={styles.li}>
            {href ? (
                <Link href={href} as={as} legacyBehavior>
                    <a dangerouslySetInnerHTML={{ __html: title }} />
                </Link>
            ) : (
                <span dangerouslySetInnerHTML={{ __html: title }} />
            )}
        </li>
    )
}

export const Breadcrumbs: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className={styles.breadcrumbs}>
            <ul className={styles.ul}>
                <li className={styles.li}>
                    <a href="/meditor">Home</a>
                </li>

                {children}
            </ul>
        </div>
    )
}
