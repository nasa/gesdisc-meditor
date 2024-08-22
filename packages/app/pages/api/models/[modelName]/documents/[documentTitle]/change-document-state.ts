import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/service'
import { changeDocumentState } from '../../../../../../documents/service'
import { respondAsJson } from '../../../../../../utils/api'
import { apiError, ErrorCode, HttpException } from '../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const newState = decodeURIComponent(req.query.state?.toString())

    const user = await getLoggedInUser(req, res)

    if (req.method !== 'PUT' && req.method !== 'POST') {
        return apiError(
            new HttpException(ErrorCode.MethodNotAllowed, 'Method not allowed'),
            res
        )
    }

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
        return apiError(error, res)
    }

    return respondAsJson(document, req, res)
}
