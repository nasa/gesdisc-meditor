import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../auth/user'
import {
    createCommentAsUser,
    getCommentsForDocument,
} from '../../../../../../../comments/service'
import {
    apiError,
    BadRequestException,
    MethodNotAllowedException,
    NotFoundException,
    UnauthorizedException,
} from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // user should be logged in for any comments related activity
        const user = await getLoggedInUser(req, res)

        if (!user) {
            throw new UnauthorizedException()
        }

        const modelName = req.query.modelName.toString()
        const documentTitle = req.query.documentTitle.toString()

        switch (req.method) {
            case 'GET': {
                const [error, comments] = await getCommentsForDocument(
                    decodeURIComponent(documentTitle),
                    decodeURIComponent(modelName)
                )

                if (error || !comments.length) {
                    throw new NotFoundException(
                        `Comments not found for model '${modelName}' with document '${documentTitle}'.`
                    )
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
                    // if we see an error here, it's most likely due to a database issue. Without exposing the error itself, the best we can do is ask the user to try again
                    throw new BadRequestException(
                        'An unexpected error occurred while creating the comment, please try your request again later'
                    )
                }

                return res.status(200).json(newComment)

            default:
                throw new MethodNotAllowedException()
        }
    } catch (err: any) {
        return apiError(res, err)
    }
}
