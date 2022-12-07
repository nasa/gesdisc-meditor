import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../auth/user'
import {
    createDocument,
    getDocumentsForModel,
} from '../../../../../documents/service'
import { apiError, ErrorCode, HttpException } from '../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getLoggedInUser(req, res)
    const modelName = req.query.modelName.toString()

    switch (req.method) {
        case 'GET': {
            const [error, documents] = await getDocumentsForModel(
                modelName,
                {
                    ...(req.query.filter && { filter: req.query.filter.toString() }),
                    ...(req.query.sort && { sort: req.query.sort.toString() }),
                    ...(req.query.searchTerm && {
                        searchTerm: req.query.searchTerm.toString(),
                    }),
                },
                user
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(documents)
        }

        case 'POST': {
            if (!user) {
                return apiError(
                    new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
                    res
                )
            }

            const parsedDocument = JSON.parse(req.body)
            const [error, { insertedDocument, location }] = await createDocument(
                parsedDocument,
                modelName,
                user
            )
            const { _id, ...apiSafeDocument } = insertedDocument

            if (error) {
                return apiError(error, res)
            }

            res.setHeader('Location', location)

            return res.status(201).json(apiSafeDocument)
        }

        default:
            return res.status(405).end()
    }
}
