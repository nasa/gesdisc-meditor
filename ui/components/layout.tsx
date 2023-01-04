import { useRouter } from 'next/router'
import type { ReactNode } from 'react'

type PropsType = {
    children: ReactNode
}

export default function Layout({ children }: PropsType) {
    const router = useRouter()

    return router.pathname === '/installation' ? (
        <>{children}</>
    ) : (
        <div className="container-fluid">
            <div className="page-container shadow-sm">{children}</div>
        </div>
    )
}
