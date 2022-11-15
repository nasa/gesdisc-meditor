import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../auth/user'
import { getDocument } from '../../../../../../../documents/service'
import { apiError } from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = req.query.documentTitle.toString()
    const documentVersion = req.query.documentVersion.toString()
    const modelName = req.query.modelName.toString()
    const user = await getLoggedInUser(req, res)

    switch (req.method) {
        case 'GET': {
            const [error, document] = await getDocument(
                decodeURIComponent(documentTitle),
                decodeURIComponent(modelName),
                user,
                decodeURIComponent(documentVersion)
            )

            if (error) {
                return apiError(error)
            }

            return res.status(200).json(document)
        }

        default:
            return res.status(405)
    }
}
