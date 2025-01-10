import compile from 'monquery'
import { BaseRepository } from '../lib/database/base-repository'
import { Document } from '../documents/types'

export class SearchRepository extends BaseRepository<Document> {
    constructor(collection: string, titleProperty: string) {
        super(collection, titleProperty)
    }

    compileQuery(query: string) {
        return compile(query)
    }

    async search(
        query: string,
        resultsPerPage: number,
        pageNumber: number
    ): Promise<any> {
        //* The pipeline order matters: we have to sort and group by titleProperty first so that we're not matching old documents.
        return this.aggregate([
            // Do not match items that have been deleted.
            {
                $match: {
                    'x-meditor.deletedOn': { $exists: false },
                },
            },
            // Sort descending by version (date).
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            // Grab all fields in the most recent version.
            { $group: { _id: `$${this.titleProperty}`, doc: { $first: '$$ROOT' } } },
            // Put all fields of the most recent doc back into root of the document.
            { $replaceRoot: { newRoot: '$doc' } },
            // Compile Lucene syntax into MQL.
            { $match: this.compileQuery(query) },
            {
                $facet: {
                    metadata: [{ $count: 'resultsCount' }],
                    results: [
                        // Use a 1-based pageNumber for readability, but operate on a 0-based index.
                        { $skip: resultsPerPage * (pageNumber - 1) },
                        // Limit our results to the correct number.
                        { $limit: resultsPerPage },
                    ],
                },
            },
        ])
    }
}
