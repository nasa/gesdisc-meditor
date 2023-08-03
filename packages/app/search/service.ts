import compile from 'monquery'
import log from '../lib/log'
import { ErrorCode, HttpException } from '../utils/errors'

/**this searvice takes lucene query string and converts it to mongoDB query also throws an error if search query is mistyped*/

export function searchwithMonquery(searchQuery) {
    try {
        if (!searchQuery) {
            throw new HttpException(
                ErrorCode.BadRequest,
                'Search query should be typed correctly'
            )
        }

        let search = compile(searchQuery)

        return search
    } catch (error) {
        log.error(error)
        return [error, null]
    }
}
