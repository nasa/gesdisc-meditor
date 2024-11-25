import { getLoggedInUser } from 'auth/user'
import { userCanAccessModel } from 'models/service'
import type { NextApiRequest, NextApiResponse } from 'next'
import { searchInputApiSchema } from 'search/schema'
import { search } from 'search/service'
import { respondAs } from 'utils/api'
import {
    ErrorStatusText,
    HttpException,
    apiError,
    parseZodAsErrorData,
} from 'utils/errors'
import type { z } from 'zod'

//* beef up apiError to format and handle ZodErrors; create a util to turn safeParse into ErrorData
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getLoggedInUser(req, res)
    const [parsingError, parsedData] = parseZodAsErrorData<
        z.infer<typeof searchInputApiSchema>
    >(searchInputApiSchema, req.query)

    if (parsingError) {
        return apiError(parsingError, res)
    }

    const { query, format, modelName, resultsPerPage, pageNumber } = parsedData

    if (!userCanAccessModel(modelName.toString(), user)) {
        return apiError(
            new HttpException(
                ErrorStatusText.ForbiddenError,
                'User does not have access to the requested model.'
            ),
            res
        )
    }

    switch (req.method) {
        case 'GET': {
            const [error, searchResults] = await search(
                modelName,
                query,
                resultsPerPage,
                pageNumber
            )

            if (error) {
                return apiError(error, res)
            }

            return await respondAs(searchResults, req, res, {
                format,
                //* The union doesn't show it, but we have a transform on the Zod schema to uppercase this property.
                //* Sending the metadata property to the CSV parser changes the column headers, so just send the results.
                payloadPath: format === 'JSON' ? '' : 'results',
            })
        }

        default:
            return res.status(405).end()
    }
}
