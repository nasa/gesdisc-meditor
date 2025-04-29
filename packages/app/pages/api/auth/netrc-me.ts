import assert from 'assert'
import createError from 'http-errors'
import { getServerSession } from 'auth/user'
import { respondAsJson } from 'utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const session = await getServerSession(req, res)

    assert(session?.user, new createError.Unauthorized())

    return respondAsJson(session.user, req, res)
}

export default withApiErrorHandler(handler)
