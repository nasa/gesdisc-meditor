import EarthdataLoginProvider from '../../../auth/providers/earthdata-login'
import log from 'lib/log'
import NextAuth, { AuthOptions } from 'next-auth'
import { UserRepository } from '../../../auth/repository'

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
        async signIn(session) {
            const userRepository = new UserRepository()
            // @ts-expect-error TODO: the signIn callback doesn't seem to be using a type we can add to in declarations, so it's missing things like "uid" that show a TS error here
            await userRepository.createUserAccount(session.user)
            return true // expects a bool, whether user can sign in or not
        },
        async session({ session, token }) {
            // add user uid to the session
            session.user.uid = token.sub

            const userRepository = new UserRepository()
            const mEditorUser = await userRepository.getMeditorUserByUid(
                session.user.uid
            )

            session.user.roles = mEditorUser?.roles ?? []

            return session
        },
    },

    secret: process.env.NEXTAUTH_SECRET!,
}

export default NextAuth(authOptions)
