import { getServerSession } from 'next-auth'
import { getUsersDb } from './db'
import { UserWithRoles } from './types'
import { authOptions } from 'pages/api/auth/[...nextauth]'

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
