import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from 'auth/user'
import { respondAsJson } from 'utils/api'
import { apiError, ErrorCode, HttpException } from 'utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getLoggedInUser(req, res)

    if (!user) {
        return apiError(
            new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
            res
        )
    }

    switch (req.method) {
        case 'GET': {
            return respondAsJson(user, req, res)
        }

        default:
            return res.status(405).end()
    }
}
