import assert from 'assert'
import createError from 'http-errors'
import {
    createApiKeyForUser,
    listApiKeysForUser,
    MAX_ACTIVE_API_KEYS,
} from 'auth/api-keys'
import { getServerSession } from 'auth/user'
import { respondAsJson } from 'utils/api'
import { safeParseJSON } from 'utils/json'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import { z } from 'zod'
import type { NextApiRequest, NextApiResponse } from 'next'

const createApiKeyBodySchema = z.object({
    name: z
        .string({ required_error: 'Missing required `name`' })
        .trim()
        .min(1, '`name` cannot be empty')
        .max(80, '`name` must be at most 80 characters'),
    expiresAt: z.string().datetime().optional().nullable(),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res)

    assert(session?.user?.uid, new createError.Unauthorized())

    switch (req.method) {
        case 'GET': {
            const apiKeys = await listApiKeysForUser(session.user.uid)

            return respondAsJson(
                {
                    apiKeys,
                    maxActiveKeys: MAX_ACTIVE_API_KEYS,
                },
                req,
                res
            )
        }

        case 'POST': {
            const [parseError, parsedBody] = safeParseJSON(req.body)

            assert(!parseError, new createError.BadRequest('Invalid request body'))

            const body = createApiKeyBodySchema.parse(parsedBody)
            const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

            if (expiresAt) {
                assert(
                    expiresAt.getTime() > Date.now(),
                    new createError.BadRequest(
                        '`expiresAt` must be a future datetime'
                    )
                )
            }

            const createdApiKey = await createApiKeyForUser({
                uid: session.user.uid,
                name: body.name,
                expiresAt,
            })

            return respondAsJson(createdApiKey, req, res, {
                httpStatusCode: 201,
            })
        }

        default:
            throw new createError.MethodNotAllowed()
    }
}

export default withApiErrorHandler(handler)
