import { getLoggedInUser } from 'auth/user'
import { userCanAccessModel } from 'models/service'
import type { NextApiRequest, NextApiResponse } from 'next'
import { searchInputApiSchema } from 'search/schema'
import { search } from 'search/service'
import { respondAs } from 'utils/api'
import { parseZodAsErrorData } from 'utils/errors'
import type { z } from 'zod'
import assert from 'assert'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import createError from 'http-errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const [parsingError, parsedData] = parseZodAsErrorData<
        z.infer<typeof searchInputApiSchema>
    >(searchInputApiSchema, req.query)

    if (parsingError) {
        throw parsingError
    }

    const { query, format, modelName, resultsPerPage, pageNumber } = parsedData
    const user = await getLoggedInUser(req, res)

    assert(
        await userCanAccessModel(user, modelName.toString()),
        new createError.Forbidden('User does not have access to the requested model')
    )

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

export default withApiErrorHandler(handler)
