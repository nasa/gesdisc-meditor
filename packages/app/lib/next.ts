import type { NextRouter } from 'next/router'

/**
 * As an alternative to calling the underlying service for new data or calling the API (which calls the underlying service), we can let React diff the page and send us new data.
 * Source: https://www.joshwcomeau.com/nextjs/refreshing-server-side-props/
 */
function refreshDataInPlace(router: NextRouter) {
    router.replace(router.asPath)
}

export { refreshDataInPlace }
