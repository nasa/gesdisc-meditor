import type { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentsForModel } from '../../../../../documents/service'
import { apiError } from '../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = req.query.modelName.toString()

    switch (req.method) {
        case 'GET': {
            const [error, documents] = await getDocumentsForModel(modelName, {
                ...(req.query.filter && { filter: req.query.filter.toString() }),
                ...(req.query.sort && { sort: req.query.sort.toString() }),
                ...(req.query.searchTerm && {
                    searchTerm: req.query.searchTerm.toString(),
                }),
            })

            if (error) {
                return apiError(error)
            }

            return res.status(200).json(documents)
        }

        default:
            return res.status(405)
    }
}
