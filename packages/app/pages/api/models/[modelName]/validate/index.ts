import assert from 'assert'
import createError from 'http-errors'
import { getServerSession } from 'auth/user'
import { respondAsJson } from 'utils/api'
import { safeParseJSON } from 'utils/json'
import { strictValidateDocument } from 'documents/service'
import { userCanAccessModel } from 'models/service'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'POST', new createError.MethodNotAllowed())

    const modelName = decodeURIComponent(req.query.modelName.toString())
    const session = await getServerSession(req, res)

    assert(
        await userCanAccessModel(session.user, modelName),
        new createError.Forbidden('User does not have access to the requested model')
    )

    const [parsingError, parsedDocument] = safeParseJSON(req.body)

    if (parsingError) {
        throw parsingError
    }

    const [validationError, validDocument] = await strictValidateDocument(
        parsedDocument,
        modelName
    )

    if (validationError) {
        throw validationError
    }

    return respondAsJson(validDocument, req, res, {
        httpStatusCode: 200,
    })
}

export default withApiErrorHandler(handler)
