import styles from './breadcrumbs.module.css'
import Link from 'next/link'

export const Breadcrumb = (props) => {
    return (
        <li className={styles.li}>
            {props.href ? (
                <Link href={props.href} as={props.as}>
                    <a dangerouslySetInnerHTML={{ __html: props.title }} />
                </Link>
            ) : (
                <span dangerouslySetInnerHTML={{ __html: props.title }} />
            )}
        </li>
    )
}

export const Breadcrumbs = ({ children }) => {
    return (
        <div className={styles.breadcrumbs}>
            <ul className={styles.ul}>
                <Breadcrumb title="Home" href="/meditor" />

                {children}
            </ul>
        </div>
    )
}
