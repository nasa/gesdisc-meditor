import assert from 'assert'
import createError from 'http-errors'
import { respondAsJson } from 'utils/api'
import { safeParseJSON } from 'utils/json'
import { strictValidateDocument } from 'documents/service'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import { withUserCanAccessModelCheck } from 'lib/with-user-can-access-model-check'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'POST', new createError.MethodNotAllowed())

    const modelName = decodeURIComponent(req.query.modelName.toString())

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

export default withApiErrorHandler(withUserCanAccessModelCheck(handler))
