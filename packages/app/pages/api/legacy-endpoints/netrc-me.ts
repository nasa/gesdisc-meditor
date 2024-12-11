import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from 'auth/user'
import { respondAsJson } from 'utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import createError from 'http-errors'
import assert from 'assert'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    return respondAsJson(await getLoggedInUser(req, res), req, res)
}

export default withApiErrorHandler(handler)
