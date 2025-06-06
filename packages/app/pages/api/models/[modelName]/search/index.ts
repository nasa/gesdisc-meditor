import assert from 'assert'
import createError from 'http-errors'
import { parseZodAsErrorData } from 'utils/errors'
import { respondAs } from 'utils/api'
import { search } from 'search/service'
import { searchInputApiSchema } from 'search/schema'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import { withUserCanAccessModelCheck } from 'lib/with-user-can-access-model-check'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { z } from 'zod'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const [parsingError, parsedData] = parseZodAsErrorData<
        z.infer<typeof searchInputApiSchema>
    >(searchInputApiSchema, req.query)

    if (parsingError) {
        throw parsingError
    }

    const { query, format, modelName, resultsPerPage, pageNumber } = parsedData
    const [error, searchResults] = await search(
        modelName,
        query,
        resultsPerPage,
        pageNumber
    )

    if (error) {
        throw error
    }

    return await respondAs(searchResults, req, res, {
        format,
        //* The union doesn't show it, but we have a transform on the Zod schema to uppercase this property.
        //* Sending the metadata property to the CSV parser changes the column headers, so just send the results.
        payloadPath: format === 'JSON' ? '' : 'results',
    })
}

export default withApiErrorHandler(withUserCanAccessModelCheck(handler))
