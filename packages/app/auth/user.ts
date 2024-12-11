import type { Session } from 'next-auth'
import { onlyUnique } from '../utils/array'
import type { WorkflowNode } from '../workflows/types'
import { getUsersDb } from './db'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import { UserWithRoles } from './types'

export async function getLoggedInUser(
    req: any,
    res: any
): Promise<UserWithRoles | undefined> {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.uid) {
        // user is not logged in
        return
    }

    const usersDb = await getUsersDb()
    const mEditorUser = await usersDb.getMeditorUserByUid(session.user.uid)

    return {
        ...session.user,
        roles: mEditorUser?.roles ?? [],
    }
}

export async function rolesForModel(
    session: Session,
    modelName: string
): Promise<Array<string>> {
    if (!session.user?.uid) {
        return []
    }

    const usersDb = await getUsersDb()
    const mEditorUser = await usersDb.getMeditorUserByUid(session.user.uid)

    return (mEditorUser?.roles ?? [])
        .filter(role => role.model === modelName) // only get roles for the requested model name
        .map(role => role.role) // retrieve the role name
        .filter(onlyUnique)
}

export async function privilegesForModelAndWorkflowNode(
    session: Session,
    modelName: string,
    node: WorkflowNode
) {
    if (!node?.privileges) {
        return []
    }

    let privileges = []
    let roles = await rolesForModel(session, modelName)

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
