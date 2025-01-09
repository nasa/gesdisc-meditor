import { connectionPromise } from 'lib/mongodb'
import { DatabaseConnection } from './types'
import { Document } from 'documents/types'
import { WithId } from 'mongodb'

export interface DatabaseOperations<T> {
    findAll(): Promise<T[]>
    findByTitle(title: string): Promise<T | null>
    aggregate(pipeline: any[]): Promise<any[]>

    /*
    find(filter?: Filter, sort?: Sort): Promise<T[]>
    findOne(filter: Filter): Promise<T | null>
    findById(id: string): Promise<T | null>
    create(data: Partial<T>): Promise<T>
    update(filter: Filter, update: UpdateQuery<T>): Promise<T | null>
    delete(filter: Filter): Promise<boolean>
    count(filter?: Filter): Promise<number>
    exists(filter: Filter): Promise<boolean>*/
}

export class BaseRepository<T> implements DatabaseOperations<T> {
    protected db: Promise<DatabaseConnection>

    constructor(
        protected collection: string,
        protected titleProperty: string = 'title'
    ) {
        this.db = connectionPromise
    }

    /**
     * Retrieves ALL documents from a given collection.
     */
    async findAll(): Promise<T[]> {
        return this.aggregate([
            // only fetch the latest version of each document
            ...this.latestVersionOfDocumentQuery(),
        ])
    }

    /**
     * Find a single document by it's title
     */
    async findByTitle(title: string): Promise<T | null> {
        const [model] = await this.aggregate([
            {
                $match: {
                    [this.titleProperty]: title,
                },
            },

            // only fetch latest version of the document
            ...this.latestVersionOfDocumentQuery(),

            {
                $limit: 1,
            },
        ])

        return this.makeSafeObjectIDs(model)
    }

    async aggregate(pipeline: any[]): Promise<any[]> {
        return (await this.db)
            .collection(this.collection)
            .aggregate(pipeline)
            .toArray()
    }

    /*
    async find(filter: Filter = {}, sort?: Sort): Promise<T[]> {
        let query = this.db.collection(this.collection).find(filter)
        if (sort) {
            query = query.sort(sort)
        }
        return query.toArray()
    }

    async findOne(filter: Filter): Promise<T | null> {
        return this.db.collection(this.collection).findOne(filter)
    }

    async findById(id: string): Promise<T | null> {
        return this.findOne({ _id: this.db.ObjectId(id) })
    }

    async create(data: Partial<T>): Promise<T> {
        const result = await this.db.collection(this.collection).insertOne(data)
        return this.findById(result.insertedId)
    }

    async update(filter: Filter, update: UpdateQuery<T>): Promise<T | null> {
        await this.db.collection(this.collection).updateOne(filter, update)
        return this.findOne(filter)
    }

    async delete(filter: Filter): Promise<boolean> {
        const result = await this.db.collection(this.collection).deleteOne(filter)
        return result.deletedCount > 0
    }

    async count(filter: Filter = {}): Promise<number> {
        return this.db.collection(this.collection).countDocuments(filter)
    }

    async exists(filter: Filter): Promise<boolean> {
        return this.count(filter).then(count => count > 0)
    }
    */

    /**
     * mEditor stores all versions of all documents in the same collection, so we just want to grab the latest version of each document
     */
    private latestVersionOfDocumentQuery() {
        return [
            // Sort descending by version (date)
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            // Grab all fields in the most recent version
            { $group: { _id: `$${this.titleProperty}`, doc: { $first: '$$ROOT' } } },
            // Put all fields of the most recent doc back into root of the document
            { $replaceRoot: { newRoot: '$doc' } },
        ]
    }

    /**
     * Next doesn't know how to process the Mongo _id property, as it's an object, not a string. So this hack parses ahead of time
     * https://github.com/vercel/next.js/issues/11993
     */
    private makeSafeObjectIDs(
        records: Record<string, any> | Record<string, any>[] | WithId<Document> | null
    ) {
        return !!records ? JSON.parse(JSON.stringify(records)) : records
    }
}
