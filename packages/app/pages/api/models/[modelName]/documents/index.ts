import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from 'auth/user'
import { createDocument, getDocumentsForModel } from 'documents/service'
import { userCanAccessModel } from 'models/service'
import { respondAsJson } from 'utils/api'
import { apiError, ErrorCode, HttpException } from 'utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    if (!userCanAccessModel(modelName, user)) {
        return apiError(
            new HttpException(
                ErrorCode.ForbiddenError,
                'User does not have access to the requested model'
            ),
            res
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

            return respondAsJson(documents, req, res)
        }

        case 'POST': {
            if (!user) {
                return apiError(
                    new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
                    res
                )
            }

            const parsedDocument = JSON.parse(req.body)
            const [error, data] = await createDocument(
                parsedDocument,
                modelName,
                user
            )

            if (error) {
                return apiError(error, res)
            }

            const { _id, ...apiSafeDocument } = data.insertedDocument

            res.setHeader('Location', data.location)

            return respondAsJson(apiSafeDocument, req, res, {
                httpStatusCode: 201,
            })
        }

        default:
            return res.status(405).end()
    }
}
