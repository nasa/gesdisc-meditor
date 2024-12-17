import log from '../lib/log'
import { getModel } from '../models/service'
import { getSearchDb } from './db'
import { searchInputServiceSchema } from './schema'
import type { ErrorData } from '../declarations'
import type { PaginatedSearchResults } from './types'

export async function search(
    modelName: string,
    query: string,
    resultsPerPage: number,
    pageNumber: number
): Promise<ErrorData<PaginatedSearchResults>> {
    try {
        const searchDb = await getSearchDb()
        const parsedInput = searchInputServiceSchema.parse({
            modelName,
            pageNumber,
            query,
            resultsPerPage,
        })
        const [modelError, { titleProperty }] = await getModel(modelName)

        if (modelError) {
            throw modelError
        }

        const [{ metadata, results }] = await searchDb.search(
            parsedInput.modelName,
            titleProperty,
            parsedInput.query,
            parsedInput.resultsPerPage,
            parsedInput.pageNumber
        )
        const resultsCount = metadata.length ? metadata[0]?.resultsCount : 0

        return [
            null,
            {
                metadata: {
                    pageCount: Math.max(Math.ceil(resultsCount / resultsPerPage), 1),
                    pageNumber,
                    query,
                    resultsCount,
                    resultsPerPage,
                },
                results,
            },
        ]
    } catch (error) {
        log.error(error)

        //* monquery throws an AssertionError for Lucene syntax errors.
        if (error.name === 'AssertionError') {
            return [formatAssertionError(error), null]
        }

        return [error, null]
    }
}

//* This might be useful if directly integrated into the apiError function, but for now it's a one-off use case.
function formatAssertionError(error: Error) {
    return Error(`Lucene syntax error: ${error.message}.`, {
        cause: { status: 400 },
    })
}
