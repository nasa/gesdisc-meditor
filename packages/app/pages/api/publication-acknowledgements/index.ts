import assert from 'assert'
import createError from 'http-errors'
import { AcknowledgementsBearerTokenDecryptedParts } from 'webhooks/types'
import { decryptData } from 'utils/encrypt'
import { handlePublicationAcknowledgement } from 'publication-queue/service'
import { publicationAcknowledgementSchema } from 'publication-queue/schema'
import { safeParseJSON } from 'utils/json'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import { z } from 'zod'
import type { NextApiRequest, NextApiResponse } from 'next'

const headersSchema = z.object({
    authorization: z
        .string({
            required_error: 'Missing required `Authorization` header',
        })
        .startsWith(
            'Bearer ',
            'Authorization header must be in the format "Bearer TOKEN"'
        ),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'POST', new createError.MethodNotAllowed())

    // verify the bearer token is present and valid
    const parsedHeaders = headersSchema.parse(req.headers)

    const [_key, token] = parsedHeaders.authorization.split('Bearer ')

    assert(
        req.body !== '',
        new createError.BadRequest('Must include a body with the request')
    )

    // verify the request body contains a proper acknowledgement
    const [parseError, parsedBody] = safeParseJSON(req.body)

    assert(!parseError, parseError)

    // parse the acknowledgement from the body
    const acknowledgement = publicationAcknowledgementSchema.parse(parsedBody)

    const decryptedToken =
        decryptData<AcknowledgementsBearerTokenDecryptedParts>(token)

    // make sure the document matches the token
    assert(
        decryptedToken._id === acknowledgement.id &&
            decryptedToken.modelName === acknowledgement.model,
        new createError.Unauthorized('Invalid token')
    )

    // handle the acknowledgement!
    await handlePublicationAcknowledgement(acknowledgement)

    return res.status(204).end()
}

export default withApiErrorHandler(handler)
