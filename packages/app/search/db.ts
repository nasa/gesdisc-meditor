import type { Db } from 'mongodb'
import compile from 'monquery'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'

class searchDb {
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    compileQuery(query: string) {
        return compile(query)
    }

    async search(
        modelName: string,
        titleProperty: string,
        query: string,
        resultsPerPage: number,
        pageNumber: number
    ): Promise<any> {
        //* The pipeline order matters: we have to sort and group by titleProperty first so that we're not matching old documents.
        const pipeline = [
            // Do not match items that have been deleted.
            {
                $match: {
                    'x-meditor.deletedOn': { $exists: false },
                },
            },
            // Sort descending by version (date).
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            // Grab all fields in the most recent version.
            { $group: { _id: `$${titleProperty}`, doc: { $first: '$$ROOT' } } },
            // Put all fields of the most recent doc back into root of the document.
            { $replaceRoot: { newRoot: '$doc' } },
            // Compile Lucene syntax into MQL.
            { $match: this.compileQuery(query) },
            // Use a 1-based pageNumber for readability, but operate on a 0-based index.
            { $skip: resultsPerPage * (pageNumber - 1) },
            // Limit our results to the correct number.
            { $limit: resultsPerPage },
        ]
        const searchResults = await this.#db
            .collection(modelName)
            .aggregate(pipeline, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(searchResults)
    }
}

const db = new searchDb()

async function getSearchDb() {
    await db.connect(getDb)

    return db
}

export { getSearchDb }
