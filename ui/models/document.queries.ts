import { BadRequestException } from '../utils/errors'
import { convertLuceneQueryToMongo } from '../utils/search'
import { addStatesToDocument, latestVersionOfDocument } from './shared.queries'
import type { DocumentsSearchOptions } from './types'

const DEFAULT_SORT = '-x-meditor.modifiedOn'

export function getDocumentsForModelQuery(
    titleProperty: string,
    searchOptions: DocumentsSearchOptions
) {
    // parse out what we'll sort on, or fall back to the default
    const sortProperty = (searchOptions?.sort || DEFAULT_SORT).replace(/^-/, '')
    const sortDir = (searchOptions?.sort || DEFAULT_SORT).charAt(0) == '-' ? -1 : 1

    let query: any[] = [
        // filter out deleted documents
        {
            $match: {
                'x-meditor.deletedOn': { $exists: false },
            },
        },

        // since documents can be so large, only include a handful of needed fields
        // TODO: once pagination is added to the API, this shouldn't be needed anymore
        {
            $project: {
                _id: 0,
                title: `$${titleProperty}`, // add a title field that matches the `titleProperty` field
                [titleProperty]: 1,
                'x-meditor': 1,
            },
        },

        // make sure we only return the latest version of each document (collection holds document history)
        ...latestVersionOfDocument(titleProperty),

        // add states to the document
        ...addStatesToDocument(),

        // sort the result
        {
            $sort: {
                [sortProperty]: sortDir,
            },
        },
    ]

    // if the user is searching the documents, we'll convert their query to the mongo equivalent
    if (searchOptions?.filter) {
        try {
            // add another match to query for the user's filter
            query.push({
                $match: convertLuceneQueryToMongo(searchOptions.filter),
            })
        } catch (err) {
            throw new BadRequestException('Improperly formatted filter')
        }
    }

    return query
}
