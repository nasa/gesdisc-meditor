import { useRouter } from 'next/router'
import type { PropsWithChildren } from 'react'

export default function Layout({ children }: PropsWithChildren) {
    const router = useRouter()

    return router.pathname === '/installation' ? (
        <>{children}</>
    ) : (
        <div className="container-fluid">
            <div className="page-container shadow-sm">{children}</div>
        </div>
    )
}
