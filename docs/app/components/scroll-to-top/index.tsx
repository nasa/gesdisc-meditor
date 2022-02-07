import useScrollPosition from '@react-hook/window-scroll'
import { FaChevronUp } from 'react-icons/fa'
import { LinksFunction } from 'remix'
import styles from './styles.css'

export const links: LinksFunction = () => {
    return [
        {
            rel: 'stylesheet',
            href: styles,
        },
    ]
}

export function ScrollToTop() {
    const scrollY = useScrollPosition(60)

    return (
        <button
            aria-label="Scroll to the top of the page."
            className="rounded-3 bg-dark text-white border-0 d-flex justify-content-center align-items-center position-fixed scroll-to-top"
            disabled={!(scrollY > 300)}
            onClick={() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                })
            }}
            type="button"
        >
            <FaChevronUp aria-hidden="true" size={20} />
        </button>
    )
}
