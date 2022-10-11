import { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../../auth/user'
import {
    getCommentForDocument,
    updateCommentAsUser,
} from '../../../../../../../../comments/service'
import {
    apiError,
    BadRequestException,
    MethodNotAllowedException,
    NotFoundException,
    UnauthorizedException,
} from '../../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // user should be logged in for any comments related activity
        const user = await getLoggedInUser(req, res)

        if (!user) {
            throw new UnauthorizedException()
        }

        const commentId = req.query.commentId.toString()
        const documentTitle = req.query.documentTitle.toString()
        const modelName = req.query.modelName.toString()

        switch (req.method) {
            case 'GET': {
                const [error, comment] = await getCommentForDocument({
                    commentId: decodeURIComponent(commentId),
                    documentTitle: decodeURIComponent(documentTitle),
                    modelName: decodeURIComponent(modelName),
                })

                if (error || !Object.keys(comment).length) {
                    throw new NotFoundException(
                        `Comments not found for model '${modelName}' with document '${documentTitle}' and comment ID '${commentId}'.`
                    )
                }

                return res.status(200).json(comment)
            }

            case 'PUT':
                const [error, updatedComment] = await updateCommentAsUser(
                    req.body,
                    user
                )

                if (error) {
                    // if we see an error here, it's most likely due to a database issue. Without exposing the error itself, the best we can do
                    // is ask the user to try again
                    throw new BadRequestException(
                        'An unexpected error occurred while updating the comment, please try your request again later'
                    )
                }

                return res.status(200).json(updatedComment)

            default:
                throw new MethodNotAllowedException()
        }
    } catch (err) {
        return apiError(res, err)
    }
}
