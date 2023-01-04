import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../auth/user'
import {
    createDocument,
    getDocumentsForModel,
} from '../../../../../documents/service'
import { userCanAccessModel } from '../../../../../models/service'
import { apiError, ErrorCode, HttpException } from '../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    if (!userCanAccessModel(modelName, user)) {
        throw new HttpException(
            ErrorCode.ForbiddenError,
            'User does not have permission to the requested model'
        )
    }

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
