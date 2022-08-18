import Link from 'next/link'
import styles from './breadcrumbs.module.css'

export const Breadcrumb = props => {
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

export const Breadcrumbs: React.FC = ({ children }) => {
    return (
        <div className={styles.breadcrumbs}>
            <ul className={styles.ul}>
                <Breadcrumb title="Home" href="/" />

                {children}
            </ul>
        </div>
    )
}
