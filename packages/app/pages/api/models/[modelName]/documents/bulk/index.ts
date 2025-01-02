import assert from 'assert'
import createError from 'http-errors'
import { bulkPatchDocuments } from 'documents/service'
import { formatZodError, withApiErrorHandler } from 'lib/with-api-error-handler'
import { getServerSession } from 'auth/user'
import { parseZodAsErrorData } from 'utils/errors'
import { respondAsJson } from 'utils/api'
import { withUserCanAccessModelCheck } from 'lib/with-user-can-access-model-check'
import {
    bulkDocumentHeadersSchema,
    patchDocumentsInputSchema,
} from 'documents/schema'
import type { JSONPatchDocument } from 'immutable-json-patch'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { ZodError } from 'zod'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'PATCH', new createError.MethodNotAllowed())

    const modelName = decodeURIComponent(req.query.modelName.toString())
    const session = await getServerSession(req, res)

    //* we enforce requiring the user to provide explicit identifiers for the documents to patch (we don't support all/*)
    //* the standard is to use an "If-Match" header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match
    const [headersError, headers] = parseZodAsErrorData<any>(
        bulkDocumentHeadersSchema,
        req.headers
    )

    if (headersError) {
        throw formatZodError(headersError as ZodError, '`If-Match` header: ') // format the ZodError so we can use a custom error message prefix
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
        throw parsingError
    }

    const [error, result] = await bulkPatchDocuments(
        documentTitles,
        modelName,
        session.user,
        operations
    )

    if (error) {
        throw error
    }

    return respondAsJson(result, req, res)
}

export default withApiErrorHandler(withUserCanAccessModelCheck(handler))
