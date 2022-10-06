import { NextApiRequest, NextApiResponse } from 'next'

const LEGACY_API_HOST = process.env.API_HOST || 'meditor_server:8081'
const LEGACY_MEDITOR_SESSION_COOKIE = '__mEditor'

/**
 * for the time being, authentication is ONLY handled in the legacy API (/nodejs-server-server)
 *
 * In the future, we'll want to use NextAuth (without breaking .netrc based logins). This function matches the parameter definition
 * of the "unstable_getServerSideSession" function in NextAuth and can be augmented.
 */
export async function getLoggedInUser(req: NextApiRequest, _res: NextApiResponse) {
    return getUserBySessionCookie(req)
}

/**
 * if the user has a mEditor session cookie, we'll use the legacy API to get the logged in user's information
 */
export async function getUserBySessionCookie(req: NextApiRequest) {
    const legacySession = req.cookies[LEGACY_MEDITOR_SESSION_COOKIE]

    if (!legacySession) {
        // this user is not logged in using a legacy session cookie
        return
    }

    const getMeResponse = await fetch(`http://${LEGACY_API_HOST}/meditor/api/me`, {
        credentials: 'include',
        headers: { Cookie: `${LEGACY_MEDITOR_SESSION_COOKIE}=${legacySession}` },
    })

    if (!getMeResponse.ok) {
        // no legacy user found
        return
    }

    const user = await getMeResponse.json()

    return {
        ...user,
        name: [user.firstName, user.lastName].join(' '),
    }
}
