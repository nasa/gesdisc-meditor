// pages/api/auth/custom-login.js
import { basePath, EDLTokenSetParameters } from 'auth/providers/earthdata-login'
import log from 'lib/log'
import { NextApiRequest, NextApiResponse } from 'next'
import { encode } from 'next-auth/jwt'
import { apiError, ErrorCode, HttpException } from 'utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            throw new HttpException(ErrorCode.MethodNotAllowed, 'Method not allowed')
        }

        if (!req.query.code) {
            throw new HttpException(
                ErrorCode.BadRequest,
                'Missing `code` from Earthdata Login'
            )
        }

        // we've successfully logged in, now we need to fetch a token from Earthdata Login
        const tokenResult = await fetch(`${basePath}/oauth/token`, {
            method: 'POST',
            body: `grant_type=authorization_code&code=${
                req.query.code
            }&redirect_uri=${encodeURIComponent(
                `${process.env.HOST}/api/legacy-endpoints/netrc-callback`
            )}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: Buffer.from(
                    `${process.env.AUTH_CLIENT_ID}:${process.env.AUTH_CLIENT_SECRET}`
                ).toString('base64'),
            },
        })

        if (!tokenResult.ok) {
            log.error(
                `Failed to retrieve a token from Earthdata Login ${tokenResult.status}, ${tokenResult.statusText}`
            )
            throw new HttpException(
                ErrorCode.BadRequest,
                'Unable to retrieve token from Earthdata Login'
            )
        }

        const tokenParameters: EDLTokenSetParameters = await tokenResult.json()

        log.debug('Tokens returned from Earthdata Login: ', tokenParameters)

        // now that we have our access token, we can request the logged in users information!
        const userResult = await fetch(`${basePath}/oauth/userinfo`, {
            headers: {
                Authorization: `${tokenParameters.token_type} ${tokenParameters.access_token}`,
            },
        })

        if (!userResult.ok) {
            throw new HttpException(
                ErrorCode.Unauthorized,
                'Failed to retrieve user information'
            )
        }

        const userInfo = await userResult.json()
        const maxAge = 30 * 24 * 60 * 60 // 30 days

        const nextAuthToken = await encode({
            token: {
                email: userInfo.email_address,
                name: `${userInfo.first_name} ${userInfo.last_name}`,
                sub: userInfo.sub,
                uid: userInfo.sub,
            },
            secret: process.env.NEXTAUTH_SECRET!,
            maxAge,
        })

        res.setHeader('Set-Cookie', [
            `next-auth.session-token=${nextAuthToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
        ])

        res.status(200).json(userInfo)
    } catch (err) {
        return apiError(err, res)
    }
}
