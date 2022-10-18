import { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentsForModel } from '../../../../../documents/service'
import { apiError } from '../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const documents = await getDocumentsForModel(
            req.query.modelName?.toString(),
            {
                ...(req.query.filter && { filter: req.query.filter.toString() }),
                ...(req.query.sort && { sort: req.query.sort.toString() }),
                ...(req.query.searchTerm && {
                    searchTerm: req.query.searchTerm.toString(),
                }),
            }
        )

        return res.status(200).json(documents)
    } catch (err) {
        return apiError(res, err)
    }
}
