import { getLoggedInUser } from 'auth/user'
import {
    bulkDocumentHeadersSchema,
    patchDocumentsInputSchema,
} from 'documents/schema'
import { bulkPatchDocuments } from 'documents/service'
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
                bulkDocumentHeadersSchema,
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

            const [error, result] = await bulkPatchDocuments(
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
