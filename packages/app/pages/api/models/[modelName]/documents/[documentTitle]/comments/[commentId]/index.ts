import assert from 'assert'
import createError from 'http-errors'
import { getServerSession } from '../../../../../../../../auth/user'
import { respondAsJson } from '../../../../../../../../utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
    getCommentForDocument,
    updateCommentAsUser,
} from '../../../../../../../../comments/service'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const commentId = decodeURIComponent(req.query.commentId.toString())
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const session = await getServerSession(req, res)

    // user should be logged in for any comments related activity
    assert(session?.user, new createError.Unauthorized())

    switch (req.method) {
        case 'GET': {
            const [error, comment] = await getCommentForDocument(
                commentId,
                documentTitle,
                modelName
            )

            if (error) {
                throw error
            }

            return respondAsJson(comment, req, res)
        }

        case 'PUT':
            const [error, updatedComment] = await updateCommentAsUser(
                // as a safeguard, only pull the items from the request the user can actually update
                {
                    _id: req.query.commentId.toString(),
                    resolved: req.body.resolved,
                    text: req.body.text,
                },
                session?.user
            )

            if (error) {
                // if we see an error here, it's most likely due to a database issue. Without exposing the error itself, the best we can do
                // is ask the user to try again
                throw error
            }

            return respondAsJson(updatedComment, req, res)

        default:
            throw new createError.MethodNotAllowed()
    }
}

export default withApiErrorHandler(handler)
