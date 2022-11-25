import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/user'
import { changeDocumentState } from '../../../../../../documents/service'
import { apiError, ErrorCode, HttpException } from '../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = req.query.documentTitle.toString()
    const modelName = req.query.modelName.toString()
    const newState = req.query.state?.toString()

    const user = await getLoggedInUser(req, res)

    switch (req.method) {
        case 'GET': {
            const [error, document] = await changeDocumentState(
                decodeURIComponent(documentTitle),
                decodeURIComponent(modelName),
                newState,
                user,
                {
                    disableEmailNotifications:
                        req.query.notify?.toString() === 'false',
                }
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(document)
        }

        case 'PUT': {
            //! TODO: still need to implement this!
            return res.status(500).end()
        }

        default:
            return apiError(
                new HttpException(ErrorCode.MethodNotAllowed, 'Method not allowed'),
                res
            )
    }
}
