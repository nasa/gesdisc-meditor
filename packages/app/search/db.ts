import type { Db } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import type { Model } from './types'
import type { DocumentsSearchOptions } from './types'
import { searchwithMonquery } from './service'

export const MODELS_COLLECTION = 'Models'
export const MODELS_TITLE_PROPERTY = 'name'

class searchDb {
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    /* *  This function go to database and return a query with results.*/
    async searchQuery(query: string): Promise<Model> {
        const searchResults = await this.#db
            .collection(MODELS_COLLECTION)
            .find({ query })
            .sort({ 'x-meditor.modifiedOn': -1 })
            .limit(1)
            .toArray()

        return searchwithMonquery(searchResults)[0]
    }

    /* *  This function do search for specific model*/
    async searchModel(modelName: string): Promise<Model> {
        const models = await this.#db
            .collection(MODELS_COLLECTION)
            .find({ [MODELS_TITLE_PROPERTY]: modelName })
            .sort({ 'x-meditor.modifiedOn': -1 })
            .limit(1)
            .toArray()

        return makeSafeObjectIDs(models)[0]
    }

    async searchModels(): Promise<Model[]> {
        const models = await this.#db
            .collection(MODELS_COLLECTION)
            .aggregate(
                [
                    { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
                    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
                    { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
                ],
                { allowDiskUse: true }
            )
            .toArray()

        return makeSafeObjectIDs(models)
    }

    async searchDocumentsForModel(
        modelName: string,
        searchOptions: DocumentsSearchOptions,
        titleProperty: string
    ): Promise<Document[]> {
        const pipeline = [
            // filter out deleted documents
            {
                $match: {
                    'x-meditor.deletedOn': { $exists: false },
                },
            },
        ]

        // if the user is searching the documents, we'll convert their query to the mongo equivalent
        if (searchOptions?.filter) {
            try {
                // add another match to query for the user's filter
                pipeline.push({
                    $match: searchwithMonquery(searchOptions.filter),
                })
            } catch (err) {
                console.error('Improperly formatted filter', err)
            }
        }

        let documents = await this.#db
            .collection(modelName)
            .aggregate(pipeline, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(documents)
    }
}

const db = new searchDb()

async function searchModelsDb() {
    await db.connect(getDb)

    return db
}

export { searchModelsDb }
