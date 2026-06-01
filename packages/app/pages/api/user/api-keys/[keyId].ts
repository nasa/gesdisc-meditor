import assert from 'assert'
import createError from 'http-errors'
import { revokeApiKeyForUser } from 'auth/api-keys'
import { getServerSession } from 'auth/user'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'DELETE', new createError.MethodNotAllowed())

    const session = await getServerSession(req, res)

    assert(session?.user?.uid, new createError.Unauthorized())

    const keyId = decodeURIComponent(req.query.keyId.toString())

    assert(keyId, new createError.BadRequest('Missing key id'))

    await revokeApiKeyForUser(session.user.uid, keyId)

    return res.status(204).end()
}

export default withApiErrorHandler(handler)
