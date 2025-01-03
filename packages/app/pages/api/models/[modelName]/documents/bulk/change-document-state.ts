import assert from 'assert'
import createError from 'http-errors'
import { bulkChangeDocumentState } from 'documents/service'
import { bulkDocumentHeadersSchema } from 'documents/schema'
import { formatZodError, withApiErrorHandler } from 'lib/with-api-error-handler'
import { getServerSession } from 'auth/user'
import { parseZodAsErrorData } from 'utils/errors'
import { respondAsJson } from 'utils/api'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { ZodError } from 'zod'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'POST', new createError.MethodNotAllowed())

    const modelName = decodeURIComponent(req.query.modelName.toString())
    const newState = decodeURIComponent(req.query.state?.toString())
    const session = await getServerSession(req, res)

    //* we enforce requiring the user to provide explicit identifiers for the documents to patch (we don't support all)
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
        .map(title => title.trim().replace(/^"/, '').replace(/"$/, '').toLowerCase())

    //* perform state updates for all documents
    const [error, result] = await bulkChangeDocumentState(
        documentTitles,
        modelName,
        newState,
        session.user,
        {
            // disable email notifications by default, this is a bulk endpoint which will spam the userbase
            disableEmailNotifications: req.query.notify?.toString() !== 'true',
        }
    )

    if (error) {
        throw error
    }

    return respondAsJson(result, req, res)
}

export default withApiErrorHandler(handler)
