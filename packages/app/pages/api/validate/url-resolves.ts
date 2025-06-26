import assert from 'assert'
import createError from 'http-errors'
import log from '../../../lib/log'
import { getServerSession } from '../../../auth/user'
import { withApiErrorHandler } from '../../../lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'POST', new createError.MethodNotAllowed())

    // This doesn't really need to be a secure endpoint, but this is just an extra step to ensure no anonymous users are hitting the link checker API.
    const session = await getServerSession(req, res)
    assert(session?.user, new createError.Unauthorized())

    const invalidUrlError = new createError.BadRequest('Invalid URL')
    let url: URL
    let isValid: boolean

    try {
        url = new URL(req.body.url)
        let response: Response

        // HEAD is the fastest way to do this, but some servers error on HEAD requests, so we set up a second request after this one.
        response = await fetch(url, {
            method: 'HEAD',
        })

        // Allow for redirect response codes (3xx), but not client errors (4xx) except 404, or server errors (5xx). We do not refetch for 404s because we already know that doesn't resolve.
        if (!response.ok && response.status !== 404) {
            response = await fetch(url, {
                method: 'GET',
            })
        }

        // At this point, just check for an okay response. Some servers will use a 403 for a resource not behind authentication when they should use a 404. Even if we can't determine why the URL doesn't resolve, at this level we just care that it does not.
        assert(response.ok, invalidUrlError)

        isValid = true
    } catch (err) {
        log.debug(`Invalid URL: ${url}`)
        log.debug(err)
        isValid = false
    }

    return res.status(200).json({
        isValid,
    })
}

export default withApiErrorHandler(handler)
