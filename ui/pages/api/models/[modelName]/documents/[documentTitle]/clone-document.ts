import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/user'
import { cloneDocument } from '../../../../../../documents/service'
import { apiError, ErrorCode, HttpException } from '../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = req.query.documentTitle.toString()
    const newTitle = req.query.newTitle.toString()
    const modelName = req.query.modelName.toString()
    const user = await getLoggedInUser(req, res)

    switch (req.method) {
        case 'POST': {
            const [error, document] = await cloneDocument(
                decodeURIComponent(documentTitle),
                decodeURIComponent(newTitle),
                decodeURIComponent(modelName),
                user
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(document)
        }

        default:
            return apiError(
                new HttpException(ErrorCode.MethodNotAllowed, 'Method not allowed'),
                res
            )
    }
}
