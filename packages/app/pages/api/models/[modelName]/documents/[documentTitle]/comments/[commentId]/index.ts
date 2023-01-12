import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../../auth/user'
import {
    getCommentForDocument,
    updateCommentAsUser,
} from '../../../../../../../../comments/service'
import {
    apiError,
    ErrorCode,
    HttpException,
} from '../../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const commentId = decodeURIComponent(req.query.commentId.toString())
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    // user should be logged in for any comments related activity
    if (!user) {
        return apiError(
            new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
            res
        )
    }

    switch (req.method) {
        case 'GET': {
            const [error, comment] = await getCommentForDocument(
                commentId,
                documentTitle,
                modelName
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(comment)
        }

        case 'PUT':
            const [error, updatedComment] = await updateCommentAsUser(
                // as a safeguard, only pull the items from the request the user can actually update
                {
                    _id: req.query.commentId.toString(),
                    resolved: req.body.resolved,
                    text: req.body.text,
                },
                user
            )

            if (error) {
                // if we see an error here, it's most likely due to a database issue. Without exposing the error itself, the best we can do
                // is ask the user to try again
                return apiError(error, res)
            }

            return res.status(200).json(updatedComment)

        default:
            return res.status(405).end()
    }
}
