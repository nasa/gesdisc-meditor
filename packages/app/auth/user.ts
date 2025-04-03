import log from 'lib/log'
import { decode } from 'next-auth/jwt'
import { getServerSession as getServerSessionNextAuth } from 'next-auth'
import { getUsersDb } from './db'
import { Session } from 'next-auth'
import { authOptions, fromDockerSecretOrEnv } from 'pages/api/auth/[...nextauth]'

/**
 * a wrapper over the NextAuth getServerSession
 *
 *? This doesn't seem necessary but the API has changed multiple times and is a bit verbose to use as every page would need to import
 *? both getServerSession() and authOptions. This simplifies it a bit and abstracts away NextAuth from being used throughout the app
 */
export async function getServerSession(req: any, res: any): Promise<Session> {
    const session = await getServerSessionNextAuth(req, res, authOptions)

    if (!session) {
        // couldn't find a session, try to get a session using the .netrc login cookie instead
        return getNetrcServerSession(req, res)
    }

    return session
}

/**
 * for .netrc logins from localhost domains, we need to handle fetching the session a bit differently
 * we'll directly decode the token to retrieve the user id
 *
 *! This is NOT a normal authentication method, it is only used for .netrc (legacy) logins
 */
export async function getNetrcServerSession(req: any, res: any): Promise<Session> {
    try {
        if (!req.cookies?.['__mEditorNetrcToken']) {
            log.debug('No netrc token is present in the request')
            return
        }

        // decode the user from the token
        const { uid } = (await decode({
            token: req.cookies['__mEditorNetrcToken'],
            secret: fromDockerSecretOrEnv('NEXTAUTH_SECRET')!,
        })) as {
            uid: string
        }

        log.debug(`Logging in as ${uid} via .netrc login flow`)

        // fetch the mEditor user
        const usersDb = await getUsersDb()
        const mEditorUser = await usersDb.getMeditorUserByUid(uid)

        // return the session
        return {
            user: {
                id: uid,
                uid,
                roles: mEditorUser?.roles ?? [],
            },
            expires: Date.now().toString(), // placeholder expires, this session is not stored
        }
    } catch (err) {
        log.error(err)
        return
    }
}
