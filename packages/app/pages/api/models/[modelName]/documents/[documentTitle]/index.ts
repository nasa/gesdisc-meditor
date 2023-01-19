import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/user'
import { getDocument } from '../../../../../../documents/service'
import { userCanAccessModel } from '../../../../../../models/service'
import { respondAsJson } from '../../../../../../utils/api'
import { apiError, ErrorCode, HttpException } from '../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    if (!userCanAccessModel(modelName, user)) {
        throw new HttpException(
            ErrorCode.ForbiddenError,
            'User does not have permission to access this document'
        )
    }

    switch (req.method) {
        case 'GET': {
            const [error, document] = await getDocument(
                documentTitle,
                modelName,
                user
            )

            if (error) {
                return apiError(error, res)
            }

            return respondAsJson(document, req, res)
        }

        default:
            return res.status(405).end()
    }
}
