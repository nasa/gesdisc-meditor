import { ReactNode, useEffect, useRef, useState } from 'react'
import type { LinksFunction } from 'remix'
import styles from './styles.css'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type TableOfContentsProps = {
    children: ReactNode
    includeHeadings: HeadingTag[]
}

export const links: LinksFunction = () => {
    return [{ rel: 'stylesheet', href: styles }]
}

export function TableOfContents({ children, includeHeadings }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<Element[]>([])

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (containerRef.current) {
            const headings = Array.from(
                containerRef.current.querySelectorAll(includeHeadings.toString())
            )

            setHeadings(headings)
        }
    }, [children, containerRef])

    return (
        <>
            <details className="pb-4">
                <summary className="fs-2">
                    <h2 className="d-inline">Table of Contents</h2>
                </summary>
                <nav>
                    <ol className="list-unstyled">
                        {headings.map(heading => {
                            return (
                                <li
                                    className={`pb-2 ${heading.nodeName}`}
                                    key={heading.id || heading.textContent}
                                >
                                    <a href={`#${heading.id}`}>
                                        {heading.textContent}
                                    </a>
                                </li>
                            )
                        })}
                    </ol>
                </nav>
            </details>
            <div ref={containerRef}>{children}</div>
        </>
    )
}
