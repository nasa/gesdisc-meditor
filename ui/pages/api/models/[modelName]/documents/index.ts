import { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentsForModel } from '../../../../../documents/service'
import {
    apiError,
    MethodNotAllowedException,
    NotFoundException,
} from '../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
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

                if (error || !documents.length) {
                    throw new NotFoundException(
                        `Documents not found for model '${modelName}'.`
                    )
                }

                return res.status(200).json(documents)
            }

            default:
                throw new MethodNotAllowedException()
        }
    } catch (err) {
        return apiError(res, err)
    }
}
