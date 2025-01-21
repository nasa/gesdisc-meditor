import EarthdataLoginProvider from 'auth/providers/earthdata-login'
import log from 'lib/log'
import NextAuth, { AuthOptions } from 'next-auth'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { getUsersDb } from 'auth/db'

export function fromDockerSecretOrEnv(key) {
    const DOCKER_SECRETS_DIR = '/run/secrets/'
    const normalizedKey = key.toLowerCase()

    // Check Docker secrets (case-insensitively)
    if (existsSync(DOCKER_SECRETS_DIR)) {
        const secretFiles = readdirSync(DOCKER_SECRETS_DIR) // List all files in secrets dir
        const matchingSecret = secretFiles.find(
            file => file.toLowerCase() === normalizedKey
        )

        if (matchingSecret) {
            return readFileSync(DOCKER_SECRETS_DIR + matchingSecret)
                .toString()
                .trim()
        }
    }

    // Check environment variables (case-insensitively)
    const envKey = Object.keys(process.env).find(
        envVar => envVar.toLowerCase() === normalizedKey
    )

    return envKey ? process.env[envKey] : undefined
}

const EDL_AUTH_CLIENT_ID = fromDockerSecretOrEnv('AUTH_CLIENT_ID')
const EDL_AUTH_CLIENT_SECRET = fromDockerSecretOrEnv('AUTH_CLIENT_SECRET')

export const authOptions: AuthOptions = {
    // use our mEditor logger for NextAuth log messages
    debug: log.level === 'debug',
    logger: {
        error(code, metadata) {
            log.error(code, metadata)
        },
        warn(code) {
            log.warn(code)
        },
        debug(code, metadata) {
            log.debug(code, metadata)
        },
    },

    // use JWT tokens for tracking the user's session
    session: {
        strategy: 'jwt',
    },

    // custom page overrides
    pages: {
        signIn: '/meditor/signin',
    },

    // configure one or more authentication providers
    providers: [
        // Earthdata Login Provider
        ...(EDL_AUTH_CLIENT_ID && EDL_AUTH_CLIENT_SECRET
            ? [
                  EarthdataLoginProvider({
                      clientId: EDL_AUTH_CLIENT_ID,
                      clientSecret: EDL_AUTH_CLIENT_SECRET,
                  }),
              ]
            : []),
    ],

    callbacks: {
        async signIn(session) {
            const usersDb = await getUsersDb()
            // @ts-expect-error TODO: the signIn callback doesn't seem to be using a type we can add to in declarations, so it's missing things like "uid" that show a TS error here
            await usersDb.createUserAccount(session.user)
            return true // expects a bool, whether user can sign in or not
        },
        async session({ session, token }) {
            // add user uid to the session
            session.user.uid = token.sub

            const usersDb = await getUsersDb()
            const mEditorUser = await usersDb.getMeditorUserByUid(session.user.uid)

            session.user.roles = mEditorUser?.roles ?? []

            return session
        },
    },

    secret: fromDockerSecretOrEnv('NEXTAUTH_SECRET')!,
}

export default NextAuth(authOptions)
