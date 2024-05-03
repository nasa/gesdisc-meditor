import { getLoggedInUser } from 'auth/user'
import {
    patchDocumentsHeadersSchema,
    patchDocumentsInputSchema,
} from 'documents/schema'
import {
    createDocument,
    getDocumentsForModel,
    patchDocuments,
} from 'documents/service'
import type { JSONPatchDocument } from 'immutable-json-patch'
import { userCanAccessModel } from 'models/service'
import type { NextApiRequest, NextApiResponse } from 'next'
import { respondAsJson } from 'utils/api'
import {
    apiError,
    ErrorCode,
    formatZodError,
    HttpException,
    parseZodAsErrorData,
} from 'utils/errors'
import { safeParseJSON } from 'utils/json'
import type { ZodError } from 'zod'

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

            const [parsingError, parsedDocument] = safeParseJSON(req.body)

            if (parsingError) {
                return apiError(parsingError, res)
            }

            const [documentError, data] = await createDocument(
                parsedDocument,
                modelName,
                user,
                req.query.initialState?.toString()
            )

            if (documentError) {
                return apiError(documentError, res)
            }

            const { _id, ...apiSafeDocument } = data.insertedDocument

            res.setHeader('Location', data.location)

            return respondAsJson(apiSafeDocument, req, res, {
                httpStatusCode: 201,
            })
        }

        case 'PATCH': {
            if (!user) {
                return apiError(
                    new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
                    res
                )
            }

            //* we enforce requiring the user to provide explicit identifiers for the documents to patch (we don't support all/*)
            //* the standard is to use an "If-Match" header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match
            const [headersError, headers] = parseZodAsErrorData<any>(
                patchDocumentsHeadersSchema,
                req.headers
            )

            if (headersError) {
                return apiError(
                    formatZodError(headersError as ZodError, '`If-Match` header: '), // format the ZodError so we can use a custom error message prefix
                    res
                )
            }

            //* parse the document titles from 'If-Match'
            const documentTitles = headers['if-match']
                .split(',')
                .map(title => title.trim().replace(/^"/, '').replace(/"$/, ''))

            //* we'll also parse the list of operations the user requested, this will ensure they match the right format for the JSON patch spec
            const [parsingError, operations] = parseZodAsErrorData<JSONPatchDocument>(
                patchDocumentsInputSchema,
                req.body
            )

            if (parsingError) {
                return apiError(parsingError, res)
            }

            const [error, result] = await patchDocuments(
                documentTitles,
                modelName,
                user,
                operations
            )

            if (error) {
                return apiError(error, res)
            }

            return respondAsJson(result, req, res)
        }

        default:
            return res.status(405).end()
    }
}
