export { default } from 'next-auth/middleware'

export const config = {
    matcher: [
        /*
         * Require authentication for all request paths except for the ones starting with:
         * - installation
         * - signin (mEditor's sign in page)
         * - api (API routes)
         * - _next (NextJS static files)
         * - images (/public/images static images)
         * - favicon.ico
         */
        '/((?!installation|signin|api|_next|images|favicon.ico).*)',
    ],
}
