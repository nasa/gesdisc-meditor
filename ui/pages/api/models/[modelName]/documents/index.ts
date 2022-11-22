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
                return apiError(error, res)
            }

            return res.status(200).json(documents)
        }

        case 'POST': {
            // todo: Implement a RESTful POST operation to /api/models/{modelName}/documents that creates a document.
            /**
             * from https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-p2-semantics-16#section-7.1.2
             *
             * If a resource has been created on the origin server, the response SHOULD be 201 (Created) and contain a representation which describes the status of the request and refers to the new resource, and a Location header field (see Section 9.4).
             */
            return res.status(200)
        }

        default:
            return res.status(405)
    }
}
