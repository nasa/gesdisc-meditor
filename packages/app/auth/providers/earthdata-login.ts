import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/oauth'
import type { TokenSetParameters } from 'openid-client'
import { fromDockerSecretOrEnv } from 'pages/api/auth/[...nextauth]'

export interface EarthdataUser {
    uid: string
    first_name: string
    last_name: string
    email_address: string
    registered_date: string
    country: string
    study_area: string
    allow_auth_app_emails: boolean
    user_type: string
    affiliation: string
    agreed_to_meris_eula: boolean
    agreed_to_sentinel_eula: boolean
    email_verified: boolean
    user_authorized_apps: number
}

export const basePath = 'https://urs.earthdata.nasa.gov'

export type EDLTokenSetParameters = Pick<
    TokenSetParameters,
    'access_token' | 'token_type' | 'refresh_token'
> & {
    expires_in: number
    endpoint: string
}
/**
 * A custom OAuth2 Provider for authenticating to Earthdata Login
 * (https://urs.earthdata.nasa.gov, https://next-auth.js.org/configuration/providers/oauth)
 */
export default function EarthdataLoginProvider<P extends EarthdataUser = any>(
    options: OAuthUserConfig<P>
): OAuthConfig<P> {
    return {
        id: 'earthdata-login',
        name: 'Earthdata Login',
        version: '2.0',
        type: 'oauth',
        authorization: {
            // https://urs.earthdata.nasa.gov/documentation/for_integrators/api_documentation#GET/oauth/authorize
            url: `${basePath}/oauth/authorize`,
            params: {
                // disables the URS "splash screen" (the one that says "Redirecting...") for logged in users
                splash: false,
            },
        },
        token: {
            /**
             * Earthdata's OAuth2 token retrieval deviates from the Next Auth specification
             * so we will send out our own POST token request
             */
            async request({ params, provider }) {
                // https://urs.earthdata.nasa.gov/documentation/for_integrators/api_documentation#/oauth/token
                const result = await fetch(`${basePath}/oauth/token`, {
                    method: 'POST',
                    body: `grant_type=authorization_code&code=${
                        params.code
                    }&redirect_uri=${encodeURIComponent(provider.callbackUrl)}`,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: Buffer.from(
                            `${fromDockerSecretOrEnv(
                                'AUTH_CLIENT_ID'
                            )}:${fromDockerSecretOrEnv('AUTH_CLIENT_SECRET')}`
                        ).toString('base64'),
                    },
                })

                const {
                    access_token,
                    endpoint,
                    expires_in,
                    refresh_token,
                    token_type,
                }: EDLTokenSetParameters = await result.json()

                return {
                    tokens: {
                        access_token,
                        endpoint,
                        expires_at: expires_in,
                        refresh_token,
                        token_type,
                    },
                }
            },
        },
        userinfo: {
            async request(context) {
                // https://urs.earthdata.nasa.gov/documentation/for_integrators/api_documentation#/api/users/%7Buserid%7D
                const user = await fetch(`${basePath}${context.tokens.endpoint}`, {
                    headers: {
                        Authorization: `Bearer ${context.tokens.access_token}`,
                    },
                })

                return await user.json()
            },
        },
        profile(profile: EarthdataUser) {
            // map Earthdata fields to mEditor fields
            return {
                id: profile.uid,
                name: [profile.first_name, profile.last_name].join(' '),
                email: profile.email_address,
                firstName: profile.first_name,
                lastName: profile.last_name,
                lastAccessed: Date.now(),
                ...profile,
            }
        },
        options,
    }
}
