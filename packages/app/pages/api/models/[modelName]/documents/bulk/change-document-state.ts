import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from 'auth/user'
import { bulkChangeDocumentState } from 'documents/service'
import { respondAsJson } from 'utils/api'
import {
    apiError,
    ErrorCode,
    formatZodError,
    HttpException,
    parseZodAsErrorData,
} from 'utils/errors'
import { bulkDocumentHeadersSchema } from 'documents/schema'
import type { ZodError } from 'zod'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const newState = decodeURIComponent(req.query.state?.toString())

    const user = await getLoggedInUser(req, res)

    if (req.method !== 'POST') {
        return apiError(
            new HttpException(ErrorCode.MethodNotAllowed, 'Method not allowed'),
            res
        )
    }

    //* we enforce requiring the user to provide explicit identifiers for the documents to patch (we don't support all)
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

    //* perform state updates for all documents
    const [error, result] = await bulkChangeDocumentState(
        documentTitles,
        modelName,
        newState,
        user,
        {
            // disable email notifications by default, this is a bulk endpoint which will spam the userbase
            disableEmailNotifications: req.query.notify?.toString() !== 'true',
        }
    )

    if (error) {
        return apiError(error, res)
    }

    return respondAsJson(result, req, res)
}
