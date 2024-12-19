import assert from 'assert'
import createError from 'http-errors'
import log from 'lib/log'
import { getServerSession } from '../../../auth/user'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'POST', new createError.MethodNotAllowed())

    // this doesn't really need to be a secure endpoint BUT this is just an extra step to ensure no anonymous users are
    // hitting the link checker API
    const session = await getServerSession(req, res)
    assert(session.user, new createError.Unauthorized())

    let isValid

    try {
        const url = req.body.url

        let regex = new RegExp(
            /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
        )

        assert(url && url.match(regex), new createError.BadRequest('Invalid URL'))

        // try a HEAD request first
        // this is the fastest way to check as we don't get the whole page back and most servers support this
        let response = await fetch(url, {
            method: 'HEAD',
        })

        if (response.status >= 400 && response.status !== 404) {
            // servers SHOULD respond with a 404 if the page doesn't exist
            // this one didn't, so let's fallback to using the GET request method
            response = await fetch(url, {
                method: 'GET',
            })
        }

        // if page 404'ed, link is invalid
        assert(response.status !== 404, new createError.BadRequest('Invalid URL'))

        // some other response came back, set link as invalid
        assert(
            response.status < 400,
            new createError.BadRequest('Bad response from server')
        )

        isValid = true
    } catch (err) {
        log.debug(err)
        isValid = false
    }

    return res.status(200).json({
        isValid,
    })
}

export default withApiErrorHandler(handler)
