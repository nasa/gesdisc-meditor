import compile from 'monquery'
import type { Model } from '../models/types'
import type { ErrorData } from '../declarations'
import log from '../lib/log'
import { ErrorCode, HttpException } from '../utils/errors'

/**this searvice takes lucene query string and converts it to mongoDB query*/

export function searchwithMonquery(searchQuery: string) {
    try {
        if (!searchQuery) {
            throw new HttpException(
                ErrorCode.BadRequest,
                'Search query should be in correctly typed'
            )
        }

        let search = compile(searchQuery)

        return search
    } catch (error) {
        log.error(error)
        return [error, null]
    }
}
