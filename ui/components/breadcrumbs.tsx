import styles from './breadcrumbs.module.css'
import Link from 'next/link'

export const Breadcrumb = (props) => {
    return (
        <li className={styles.li}>
            {props.href ? (
                <Link href={props.href} as={props.as}>
                    <a>{props.title}</a>
                </Link>
            ) : (
                <span>
                    {props.title}
                </span>
            )}
        </li>
    )
}

export const Breadcrumbs = ({ children }) => {
    return (
        <div className={styles.breadcrumbs}>
            <ul className={styles.ul}>
                <Breadcrumb title="Home" href="/" />

                {children}
            </ul>
        </div>
    )
}
