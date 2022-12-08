import compile from 'monquery'

const searchableXMeditorProperties = [
    'modifiedOn',
    'modifiedBy',
    'state',
    'targetStates',
]

/**
 * given a simplified Lucene query, convert it to the Mongo $match equivalent
 * ONLY supports AND/OR and field based regex or exact matches
 *
 * TODO: if we need more complex searching, we should use something like ElasticSearch instead
 */
export function convertLuceneQueryToMongo(query) {
    let match = compile(query)

    function replacexMeditorFieldInMatch(field, match) {
        if (match.$and) {
            match.$and = match.$and.map(andMatch =>
                replacexMeditorFieldInMatch(field, andMatch)
            )
        }

        if (match.$or) {
            match.$or = match.$or.map(orMatch =>
                replacexMeditorFieldInMatch(field, orMatch)
            )
        }

        if (field in match) {
            match[`x-meditor.${field}`] = match[field]
            delete match[field]
        }

        return match
    }

    searchableXMeditorProperties.forEach(field => {
        replacexMeditorFieldInMatch(field, match)
    })

    return match
}
