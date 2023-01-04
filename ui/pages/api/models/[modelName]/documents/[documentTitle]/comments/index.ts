import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../auth/user'
import {
    createCommentAsUser,
    getCommentsForDocument,
} from '../../../../../../../comments/service'
import { apiError, ErrorCode, HttpException } from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getLoggedInUser(req, res)

    // user should be logged in for any comments related activity
    if (!user) {
        return apiError(
            new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
            res
        )
    }

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())

    switch (req.method) {
        case 'GET': {
            const [error, comments] = await getCommentsForDocument(
                documentTitle,
                modelName
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(comments)
        }

        case 'POST': {
            const [error, newComment] = await createCommentAsUser(
                {
                    ...req.body,
                    documentId: documentTitle,
                    model: modelName,
                },
                user
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(newComment)
        }

        default:
            return res.status(405).end()
    }
}
