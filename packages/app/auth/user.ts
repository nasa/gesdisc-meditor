import { getCookies } from 'cookies-next'
import { onlyUnique } from '../utils/array'
import type { WorkflowNode } from '../workflows/types'
import type { User, UserRole } from './types'
import type { IncomingMessage, ServerResponse } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'

const LEGACY_API_HOST = process.env.API_HOST || 'meditor_legacy-api:8081'
const LEGACY_MEDITOR_SESSION_COOKIE = '__mEditor'

/**
 * for the time being, authentication is ONLY handled in the legacy API (/legacy-api)
 *
 * In the future, we'll want to use NextAuth (without breaking .netrc based logins). This function matches the parameter definition
 * of the "unstable_getServerSideSession" function in NextAuth and can be augmented.
 */
export async function getLoggedInUser(
    req: NextApiRequest | IncomingMessage,
    res: NextApiResponse | ServerResponse
) {
    // smooths out the difference between Next's request / response type and the native HTTP versions
    const cookies = getCookies({ req, res })

    return getUserBySessionCookie(cookies)
}

/**
 * if the user has a mEditor session cookie, we'll use the legacy API to get the logged in user's information
 */
export async function getUserBySessionCookie(cookies: {
    [key: string]: string | undefined
}) {
    const legacySession = cookies[LEGACY_MEDITOR_SESSION_COOKIE]

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

export function rolesForModel(user: User, modelName: string): Array<string> {
    return (user?.roles || ([] as UserRole[]))
        .filter(role => role.model === modelName) // only get roles for the requested model name
        .map(role => role.role) // retrieve the role name
        .filter(onlyUnique)
}

export function privilegesForModelAndWorkflowNode(
    user: User,
    modelName: string,
    node: WorkflowNode
) {
    if (!node?.privileges) {
        return []
    }

    let privileges = []
    let roles = rolesForModel(user, modelName)

    roles.forEach(role => {
        privileges = privileges.concat(
            node.privileges
                // only retrieve privilege matching the current role (ex. Author)
                .filter(nodePrivilege => nodePrivilege.role == role)
                // return a list of privileges for the current role (ex. ["edit", "comment"])
                .reduce(
                    (nodePrivileges, nodePrivilege) =>
                        nodePrivileges.concat(nodePrivilege.privilege),
                    []
                )
        )
    })

    return privileges
}
