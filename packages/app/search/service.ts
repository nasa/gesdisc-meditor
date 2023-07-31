import compile from 'monquery'
import type { Model } from '../models/types'
import type { ErrorData } from '../declarations'
import { searchModelsDb } from './db'
import log from '../lib/log'

/**this searvice takes lucene query string and converts it to mongoDB query*/

export function searchwithMonquery(searchQuery) {
    let search = compile(searchQuery)

    return search
}

/*this function throws an error if there is a model users and workflows. since we do not want this models to be searched.*/
export async function getModel(modelName: string): Promise<ErrorData<Model>> {
    try {
        const [modelError, model] = await getModel(modelName)

        if (model.name.includes('Users' || 'Workflows')) {
            throw modelError
        }

        return [null, model]
    } catch (error) {
        log.error(error)
        return [error, null]
    }
}
