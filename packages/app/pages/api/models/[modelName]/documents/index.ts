import assert from 'assert'
import createError from 'http-errors'
import { createDocument, getDocumentsForModel } from 'documents/service'
import { getServerSession } from 'auth/user'
import { respondAsJson } from 'utils/api'
import { safeParseJSON } from 'utils/json'
import { userCanAccessModel } from 'models/service'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const session = await getServerSession(req, res)

    assert(
        await userCanAccessModel(session.user, modelName),
        new createError.Forbidden('User does not have access to the requested model')
    )

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
                throw error
            }

            return respondAsJson(documents, req, res)
        }

        case 'POST': {
            const [parsingError, parsedDocument] = safeParseJSON(req.body)

            if (parsingError) {
                throw parsingError
            }

            const [documentError, data] = await createDocument(
                parsedDocument,
                modelName,
                session.user,
                req.query.initialState?.toString()
            )

            if (documentError) {
                throw documentError
            }

            const { _id, ...apiSafeDocument } = data.insertedDocument

            res.setHeader('Location', data.location)

            return respondAsJson(apiSafeDocument, req, res, {
                httpStatusCode: 201,
            })
        }

        default:
            throw new createError.MethodNotAllowed()
    }
}

export default withApiErrorHandler(handler)
