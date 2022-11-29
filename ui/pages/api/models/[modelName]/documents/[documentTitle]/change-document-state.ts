import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/user'
import { changeDocumentState } from '../../../../../../documents/service'
import { apiError, ErrorCode, HttpException } from '../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = req.query.documentTitle.toString()
    const modelName = req.query.modelName.toString()
    const newState = req.query.state?.toString()

    const user = await getLoggedInUser(req, res)

    if (req.method !== 'PUT' && req.method !== 'GET') {
        return apiError(
            new HttpException(ErrorCode.MethodNotAllowed, 'Method not allowed'),
            res
        )
    }

    const shouldUpdateDocument =
        req.method === 'PUT' && req.body && Object.keys(req.body).length > 0

    // update state done for a GET and a PUT
    const [error, document] = await changeDocumentState(
        decodeURIComponent(documentTitle),
        decodeURIComponent(modelName),
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

    return res.status(200).json(document)
}
