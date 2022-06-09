export const UNSPECIFIED_STATE_NAME = 'Unspecified'
export const UNKNOWN_USER = 'Unknown'

/**
 * a commonly used query for retrieving the latest version of a document
 * the property of the document used can differ between models (one calls it title, one may call it name)
 */
export function latestVersionOfDocument(titleProperty: string) {
    // build a state to return if the document version has no state
    let unspecifiedState = {
        target: UNSPECIFIED_STATE_NAME,
        source: UNSPECIFIED_STATE_NAME,
        modifiedBy: UNKNOWN_USER,
        modifiedOn: new Date().toISOString(),
    }

    return [
        // Sort descending by version (date)
        { $sort: { 'x-meditor.modifiedOn': -1 } },
        // Grab all fields in the most recent version
        { $group: { _id: `$${titleProperty}`, doc: { $first: '$$ROOT' } } },
        // Put all fields of the most recent doc back into root of the document
        { $replaceRoot: { newRoot: '$doc' } },
        // Add unspecified state on docs with no states
        {
            $addFields: {
                'x-meditor.states': {
                    $ifNull: ['$x-meditor.states', [unspecifiedState]],
                },
            },
        },
        // Find last state
        {
            $addFields: {
                'x-meditor.state': { $arrayElemAt: ['$x-meditor.states.target', -1] },
            },
        },
    ]
}
