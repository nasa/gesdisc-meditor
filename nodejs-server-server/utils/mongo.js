// a shared place to store aggregation queries
module.exports.aggregations = {
    /**
     * returns an aggregation query for getting the latest version of a document
     */
    latestVersionOfDocument: [
        { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
        { $group: { _id: '$id', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
        { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
    ],
}
