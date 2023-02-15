import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/user'
import { cloneDocument } from '../../../../../../documents/service'
import { respondAsJson } from '../../../../../../utils/api'
import { apiError, ErrorCode, HttpException } from '../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const newTitle = decodeURIComponent(req.query.newTitle.toString())
    const user = await getLoggedInUser(req, res)

    switch (req.method) {
        case 'POST': {
            const [error, document] = await cloneDocument(
                documentTitle,
                newTitle,
                modelName,
                user
            )

            if (error) {
                return apiError(error, res)
            }

            // todo: discuss this vs createDocument's 201 w/ location header; api-safe?
            return respondAsJson(document, req, res)
        }

        default:
            return apiError(
                new HttpException(ErrorCode.MethodNotAllowed, 'Method not allowed'),
                res
            )
    }
}
