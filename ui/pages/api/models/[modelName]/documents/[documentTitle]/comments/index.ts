import { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../auth/user'
import { createCommentAsUser } from '../../../../../../../comments/service'
import {
    apiError,
    MethodNotAllowedException,
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
