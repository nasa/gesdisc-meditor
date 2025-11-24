import EarthdataLoginProvider from 'auth/providers/earthdata-login'
import log from 'lib/log'
import NextAuth, { AuthOptions } from 'next-auth'
import CognitoProvider from 'next-auth/providers/cognito'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { getUsersDb } from 'auth/db'
import { UserContactInformation } from 'auth/types'

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

// Earthdata Login configuration
const EDL_AUTH_CLIENT_ID = fromDockerSecretOrEnv('AUTH_CLIENT_ID')
const EDL_AUTH_CLIENT_SECRET = fromDockerSecretOrEnv('AUTH_CLIENT_SECRET')

// AWS Cognito configuration
const COGNITO_CLIENT_ID = fromDockerSecretOrEnv('COGNITO_CLIENT_ID')
const COGNITO_CLIENT_SECRET = fromDockerSecretOrEnv('COGNITO_CLIENT_SECRET')
const COGNITO_ISSUER = fromDockerSecretOrEnv('COGNITO_ISSUER')
const COGNITO_REGION = fromDockerSecretOrEnv('COGNITO_REGION')
const COGNITO_USER_POOL_ID = fromDockerSecretOrEnv('COGNITO_USER_POOL_ID')

// Construct Cognito issuer if not provided directly
// Format: https://cognito-idp.{region}.amazonaws.com/{userPoolId}
const cognitoIssuer =
    COGNITO_ISSUER ||
    (COGNITO_REGION && COGNITO_USER_POOL_ID
        ? `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`
        : undefined)

const hasEDLProvider = !!(EDL_AUTH_CLIENT_ID && EDL_AUTH_CLIENT_SECRET)
const hasCognitoProvider = !!(
    COGNITO_CLIENT_ID &&
    COGNITO_CLIENT_SECRET &&
    cognitoIssuer
)

if (hasEDLProvider) {
    log.info('Earthdata Login (EDL) provider configured')
}
if (hasCognitoProvider) {
    log.info('AWS Cognito provider configured')
}

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
        ...(hasEDLProvider
            ? [
                  EarthdataLoginProvider({
                      clientId: EDL_AUTH_CLIENT_ID,
                      clientSecret: EDL_AUTH_CLIENT_SECRET,
                  }),
              ]
            : []),
        // AWS Cognito Provider
        ...(hasCognitoProvider
            ? [
                  CognitoProvider({
                      clientId: COGNITO_CLIENT_ID,
                      clientSecret: COGNITO_CLIENT_SECRET,
                      issuer: cognitoIssuer,
                      profile(profile) {
                          return {
                              id: profile.sub,
                              email: profile.email,
                              name: profile.name,
                              username:
                                  profile['cognito:username'] ||
                                  profile.username ||
                                  profile.preferred_username,
                          }
                      },
                  }),
              ]
            : []),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user?.username) {
                token.username = user.username
            }

            return token
        },
        async signIn(session) {
            if (!hasEDLProvider && !hasCognitoProvider) {
                const errorMessage =
                    'Authentication misconfiguration: At least one authentication provider must be configured. ' +
                    'Please set either:\n' +
                    '  - EDL: AUTH_CLIENT_ID and AUTH_CLIENT_SECRET, or\n' +
                    '  - Cognito: COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, and either COGNITO_ISSUER or (COGNITO_REGION and COGNITO_USER_POOL_ID)'
                log.error(errorMessage)
                throw new Error(errorMessage)
            }

            const usersDb = await getUsersDb()
            await usersDb.createUserAccount(mapSessionToUser(session))
            return true // expects a bool, whether user can sign in or not
        },
        async session({ session, token }) {
            // add user uid to the session
            session.user.uid = token.sub
            // @ts-ignore
            session.user.username = token.username

            session.user = {
                ...session.user,
                ...mapSessionToUser(session),
            }

            const usersDb = await getUsersDb()
            const mEditorUser = await usersDb.getMeditorUserByUid(session.user.uid)

            session.user.roles = mEditorUser?.roles ?? []

            return session
        },
    },

    secret: fromDockerSecretOrEnv('NEXTAUTH_SECRET')!,
}

function mapSessionToUser(session: any): UserContactInformation {
    const fullName =
        session.user?.name ??
        (session.user?.firstName && session.user?.lastName
            ? `${session.user.firstName} ${session.user.lastName}`.trim()
            : '')

    let firstName = session.user?.firstName ?? ''
    if (!firstName && session.user?.name) {
        const nameParts = session.user.name.trim().split(/\s+/)
        firstName = nameParts[0] ?? ''
    }

    let lastName = session.user?.lastName ?? ''
    if (!lastName && session.user?.name) {
        const nameParts = session.user.name.trim().split(/\s+/)

        if (nameParts.length > 1) {
            lastName = nameParts.slice(1).join(' ') ?? ''
        }
    }

    let uid = session.user?.uid ?? session.user?.id ?? ''

    if (hasCognitoProvider && session.user?.username) {
        uid = session.user.username
    }

    const userContactInformation: UserContactInformation = {
        uid,
        emailAddress: session.user?.emailAddress ?? session.user?.email ?? '',
        name: fullName,
        firstName,
        lastName,
    }

    return userContactInformation
}

export default NextAuth(authOptions)
