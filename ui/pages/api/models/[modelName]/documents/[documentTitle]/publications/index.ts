import type { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentPublications } from '../../../../../../../documents/service'
import { apiError } from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = req.query.modelName.toString()
    const documentTitle = req.query.documentTitle.toString()

    switch (req.method) {
        case 'GET': {
            const [error, publications] = await getDocumentPublications(
                decodeURIComponent(documentTitle),
                decodeURIComponent(modelName)
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(publications)
        }

        default:
            return res.status(405)
    }
}
