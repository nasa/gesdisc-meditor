import { DatabaseRepositoryInterface } from 'database/types'
import { Db, Document, MongoClient, WithId } from 'mongodb'

export class MongoRepository<T> implements DatabaseRepositoryInterface<T> {
    #client: MongoClient
    #db: Db

    constructor(client: MongoClient, dbName?: string) {
        this.#client = client
        this.#db = this.#client.db(dbName ?? process.env.DB_NAME)
    }

    getDb() {
        // TODO: remove
        return this.#db
    }

    async findAll(collection: string): Promise<T[]> {
        const models = await this.#db
            .collection(collection)
            .aggregate(
                [
                    { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
                    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
                    { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
                ],
                { allowDiskUse: true }
            )
            .toArray()

        return this.#makeSafeObjectIDs(models)
    }

    async find(
        collection: string,
        title: string,
        titleProperty: string = 'title'
    ): Promise<T> {
        const models = await this.#db
            .collection(collection)
            .find({ [titleProperty]: title })
            .sort({ 'x-meditor.modifiedOn': -1 })
            .limit(1)
            .toArray()

        return this.#makeSafeObjectIDs(models)[0]
    }

    /**
     * Next doesn't know how to process the Mongo _id property, as it's an object, not a string. So this hack parses ahead of time
     * https://github.com/vercel/next.js/issues/11993
     */
    #makeSafeObjectIDs(
        records: Record<string, any> | Record<string, any>[] | WithId<Document> | null
    ) {
        return !!records ? JSON.parse(JSON.stringify(records)) : records
    }
}
