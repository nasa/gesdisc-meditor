import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../auth/service'
import { getDocument } from '../../../../../../../documents/service'
import { respondAsJson } from '../../../../../../../utils/api'
import { apiError } from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const documentVersion = decodeURIComponent(req.query.documentVersion.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    switch (req.method) {
        case 'GET': {
            const [error, document] = await getDocument(
                documentTitle,
                modelName,
                user,
                documentVersion
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
