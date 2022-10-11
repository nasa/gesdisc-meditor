import { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../auth/user'
import {
    createCommentAsUser,
    getCommentsForDocument,
} from '../../../../../../../comments/service'
import {
    apiError,
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

        const modelName = req.query.modelName?.toString()
        const documentTitle = req.query.documentTitle?.toString()

        switch (req.method) {
            case 'GET': {
                const [error, comments] = await getCommentsForDocument({
                    documentTitle: decodeURIComponent(documentTitle),
                    modelName: decodeURIComponent(modelName),
                })

                if (error || !comments.length) {
                    throw new NotFoundException(
                        `Comments not found for model '${modelName}' with document '${documentTitle}'.`
                    )
                }

                return res.status(200).json(comments)
            }

            case 'POST':
                return res.status(200).json(
                    await createCommentAsUser(
                        {
                            ...req.body,
                            documentId: documentTitle,
                            model: modelName,
                        },
                        user
                    )
                )

            default:
                throw new MethodNotAllowedException()
        }
    } catch (err: any) {
        return apiError(res, err)
    }
}
