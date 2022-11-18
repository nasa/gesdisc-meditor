import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../auth/user'
import {
    createCommentAsUser,
    getCommentsForDocument,
} from '../../../../../../../comments/service'
import { apiError, ErrorCode, HttpException } from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // user should be logged in for any comments related activity
    const user = await getLoggedInUser(req, res)

    if (!user) {
        return apiError(
            new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
            res
        )
    }

    const modelName = req.query.modelName.toString()
    const documentTitle = req.query.documentTitle.toString()

    switch (req.method) {
        case 'GET': {
            const [error, comments] = await getCommentsForDocument(
                decodeURIComponent(documentTitle),
                decodeURIComponent(modelName)
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(comments)
        }

        case 'POST':
            const [error, newComment] = await createCommentAsUser(
                {
                    ...req.body,
                    documentId: decodeURIComponent(documentTitle),
                    model: decodeURIComponent(modelName),
                },
                user
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(newComment)

        default:
            return res.status(405)
    }
}
