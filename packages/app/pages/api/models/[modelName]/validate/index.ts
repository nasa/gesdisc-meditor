import { getLoggedInUser } from 'auth/user'
import { strictValidateDocument } from 'documents/service'
import { getModelWithWorkflow, userCanAccessModel } from 'models/service'
import type { NextApiRequest, NextApiResponse } from 'next'
import { respondAsJson } from 'utils/api'
import { apiError, ErrorStatusText, HttpException } from 'utils/errors'
import { safeParseJSON } from 'utils/json'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    if (!userCanAccessModel(modelName, user)) {
        return apiError(
            new HttpException(
                ErrorStatusText.ForbiddenError,
                'User does not have access to the requested model'
            ),
            res
        )
    }

    switch (req.method) {
        //* Unlike most POST endpoints, this allows unauthenticated access.
        case 'POST': {
            const [parsingError, parsedDocument] = safeParseJSON(req.body)

            if (parsingError) {
                return apiError(parsingError, res)
            }

            const [validationError, validDocument] = await strictValidateDocument(
                parsedDocument,
                modelName
            )

            if (validationError) {
                return apiError(validationError, res)
            }

            return respondAsJson(validDocument, req, res, {
                httpStatusCode: 200,
            })
        }

        default:
            return res.status(405).end()
    }
}
