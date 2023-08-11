import type { HttpException } from 'utils/errors'
import type { ErrorData } from '../declarations'
import log from '../lib/log'
import { getModel } from '../models/service'
import { getSearchDb } from './db'
import { searchInputServiceSchema } from './schema'

export async function search(
    modelName: string,
    query: string,
    resultsPerPage: number,
    pageNumber: number
): Promise<ErrorData<any>> {
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

        const searchResults = await searchDb.search(
            parsedInput.modelName,
            titleProperty,
            parsedInput.query,
            parsedInput.resultsPerPage,
            parsedInput.pageNumber
        )

        return [null, searchResults]
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
function formatAssertionError(error: Error | HttpException) {
    return Error(`Lucene syntax error: ${error.message}.`, {
        cause: { status: 400 },
    })
}
