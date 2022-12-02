import type { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentHistory } from '../../../../../../../documents/service'
import { apiError } from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())

    switch (req.method) {
        case 'GET': {
            const [error, history] = await getDocumentHistory(
                documentTitle,
                modelName
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(history)
        }

        default:
            return res.status(405).end()
    }
}
