import type { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentHistoryByVersion } from '../../../../../../../../documents/service'
import { apiError } from '../../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const revisionId = decodeURIComponent(req.query.revisionId.toString())

    switch (req.method) {
        case 'GET': {
            const [error, history] = await getDocumentHistoryByVersion(
                revisionId,
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
