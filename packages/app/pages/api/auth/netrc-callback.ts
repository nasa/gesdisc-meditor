import assert from 'assert'
import createError from 'http-errors'
import log from 'lib/log'
import { basePath, EDLTokenSetParameters } from 'auth/providers/earthdata-login'
import { encode } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
// pages/api/auth/custom-login.js

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())
    assert(
        req.query.code,
        new createError.BadRequest('Missing `code` from Earthdata Login')
    )

    // we've successfully logged in, now we need to fetch a token from Earthdata Login
    const tokenResult = await fetch(`${basePath}/oauth/token`, {
        method: 'POST',
        body: `grant_type=authorization_code&code=${
            req.query.code
        }&redirect_uri=${encodeURIComponent(
            `${process.env.HOST}/api/auth/netrc-callback`
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

        throw new createError.BadRequest(
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

    assert(
        userResult.ok,
        new createError.Unauthorized('Failed to retrieve user information')
    )

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
}

export default withApiErrorHandler(handler)
