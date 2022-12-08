import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../auth/user'
import { apiError, ErrorCode, HttpException } from '../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // this doesn't really need to be a secure endpoint BUT this is just an extra step to ensure no anonymous users are
    // hitting the link checker API
    const user = await getLoggedInUser(req, res)

    if (!user) {
        return apiError(
            new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
            res
        )
    }

    switch (req.method) {
        case 'POST': {
            let isValid

            try {
                const url = req.body.url

                let regex = new RegExp(
                    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
                )

                if (!url || !url.match(regex)) {
                    throw new Error('Invalid URL')
                }

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

                if (response.status === 404) {
                    // page 404'ed, link is invalid
                    throw new Error('Invalid URL')
                }

                if (response.status >= 400) {
                    // some other response came back, set link as invalid
                    throw new Error('Bad response from server')
                }

                isValid = true
            } catch (err) {
                isValid = false
            }

            return res.status(200).json({
                isValid,
            })
        }

        default:
            return res.status(405).end()
    }
}
