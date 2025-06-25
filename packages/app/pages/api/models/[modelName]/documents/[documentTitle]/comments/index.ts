import assert from 'assert'
import createError from 'http-errors'
import { getServerSession } from '../../../../../../../auth/user'
import { respondAsJson } from '../../../../../../../utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
    createCommentAsUser,
    getCommentsForDocument,
} from '../../../../../../../comments/service'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res)

    assert(session?.user, new createError.Unauthorized())

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())

    switch (req.method) {
        case 'GET': {
            const [error, comments] = await getCommentsForDocument(
                documentTitle,
                modelName
            )

            if (error) {
                throw error
            }

            return respondAsJson(comments, req, res)
        }

        case 'POST': {
            const [error, newComment] = await createCommentAsUser(
                {
                    ...req.body,
                    documentId: documentTitle,
                    model: modelName,
                },
                session?.user
            )

            if (error) {
                throw error
            }

            return respondAsJson(newComment, req, res)
        }

        default:
            throw new createError.MethodNotAllowed()
    }
}

export default withApiErrorHandler(handler)
