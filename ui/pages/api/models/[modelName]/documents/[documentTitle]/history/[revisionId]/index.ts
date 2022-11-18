import type { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentHistoryByVersion } from '../../../../../../../../documents/service'
import { apiError } from '../../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET': {
            const { revisionId, documentTitle, modelName } = req.query

            const [error, history] = await getDocumentHistoryByVersion(
                decodeURIComponent(revisionId.toString()),
                decodeURIComponent(documentTitle.toString()),
                decodeURIComponent(modelName.toString())
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(history)
        }

        default:
            return res.status(405)
    }
}
