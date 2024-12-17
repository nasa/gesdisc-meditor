import EarthdataLoginProvider from 'auth/providers/earthdata-login'
import log from 'lib/log'
import NextAuth, { AuthOptions } from 'next-auth'
import { getUsersDb } from 'auth/db'

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
        ...(process.env.AUTH_CLIENT_ID && process.env.AUTH_CLIENT_SECRET
            ? [
                  EarthdataLoginProvider({
                      clientId: process.env.AUTH_CLIENT_ID,
                      clientSecret: process.env.AUTH_CLIENT_SECRET,
                  }),
              ]
            : []),
    ],

    callbacks: {
        async session({ session, token }) {
            // add user uid to the session
            session.user.uid = token.sub

            const usersDb = await getUsersDb()
            const mEditorUser = await usersDb.getMeditorUserByUid(session.user.uid)

            session.user.roles = mEditorUser?.roles ?? []

            return session
        },
    },

    secret: process.env.NEXTAUTH_SECRET!,
}

export default NextAuth(authOptions)
