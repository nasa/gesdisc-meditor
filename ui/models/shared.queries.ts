import { getDb } from '../lib/mongodb'

export const UNSPECIFIED_STATE_NAME = 'Unspecified'
export const UNKNOWN_USER = 'Unknown'

export function addStatesToDocument() {
    // build a state to return if the document version has no state
    let unspecifiedState = {
        target: UNSPECIFIED_STATE_NAME,
        source: UNSPECIFIED_STATE_NAME,
        modifiedBy: UNKNOWN_USER,
        modifiedOn: new Date().toISOString(),
    }

    return [
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

/**
 * a commonly used query for retrieving the latest version of a document
 * the property of the document used can differ between models (one calls it title, one may call it name)
 */
export function latestVersionOfDocument(titleProperty: string) {
    return [
        // Sort descending by version (date)
        { $sort: { 'x-meditor.modifiedOn': -1 } },
        // Grab all fields in the most recent version
        { $group: { _id: `$${titleProperty}`, doc: { $first: '$$ROOT' } } },
        // Put all fields of the most recent doc back into root of the document
        { $replaceRoot: { newRoot: '$doc' } },
    ]
}

/**
 * creates a searchable text index for the given collection if it doesn't already exist
 *
 * TODO: allow searching other fields, this would need to be configured in the model schema
 */
export async function createIndex(collectionName: string, titleProperty: string) {
    const db = await getDb()
    const index = {
        [titleProperty]: 'text',
    }

    await db.collection(collectionName).createIndex(index)
}
