import { getLoggedInUser } from 'auth/user'
import { parameterWithInflection } from 'lib/grammar'
import { userCanAccessModel } from 'models/service'
import type { NextApiRequest, NextApiResponse } from 'next'
import { searchInputApiSchema } from 'search/schema'
import { search } from 'search/service'
import { respondAs } from 'utils/api'
import { ErrorCode, HttpException, apiError } from 'utils/errors'
import type { ZodError } from 'zod'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const user = await getLoggedInUser(req, res)
        const { query, format, modelName, resultsPerPage, pageNumber } =
            searchInputApiSchema.parse(req.query)

        if (!userCanAccessModel(modelName.toString(), user)) {
            return apiError(
                new HttpException(
                    ErrorCode.ForbiddenError,
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
                })
            }

            default:
                return res.status(405).end()
        }
    } catch (error) {
        if (error.name === 'ZodError') {
            return apiError(formatZodError(error), res)
        }

        return apiError(error, res)
    }
}

//* If we start validating our API inputs with Zod, this should probably be integrated into the apiError function.
function formatZodError(error: ZodError) {
    const errorString = error.issues.reduce((accumulator, current, index, self) => {
        //* We want spaces between errors but not for the last error.
        const maybeSpace = index + 1 === self.length ? '' : ' '

        accumulator += `For query ${parameterWithInflection(
            current.path.length
        )} ${current.path.toString()}: ${current.message}.${maybeSpace}`

        return accumulator
    }, ``)

    return Error(errorString, {
        cause: { status: 400 },
    })
}
