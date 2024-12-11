import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/user'
import { changeDocumentState } from '../../../../../../documents/service'
import { respondAsJson } from '../../../../../../utils/api'
import assert from 'assert'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import createError from 'http-errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(
        req.method === 'PUT' || req.method === 'POST',
        new createError.MethodNotAllowed()
    )

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const newState = decodeURIComponent(req.query.state?.toString())

    const user = await getLoggedInUser(req, res)

    const shouldUpdateDocument =
        req.method === 'PUT' && req.body && Object.keys(req.body).length > 0

    // update state done for a POST and a PUT
    const [error, document] = await changeDocumentState(
        documentTitle,
        modelName,
        newState,
        user,
        {
            disableEmailNotifications: req.query.notify?.toString() === 'false',

            ...(shouldUpdateDocument && {
                dangerouslyUpdateDocumentProperties: req.body,
            }),
        }
    )

    if (error) {
        throw error
    }

    return respondAsJson(document, req, res)
}

export default withApiErrorHandler(handler)
