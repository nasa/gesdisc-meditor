import { connectionPromise } from 'lib/mongodb'
import { DatabaseConnection, Filter, Sort, UpdateQuery } from './types'
import { Document } from 'documents/types'
import { WithId } from 'mongodb'

export interface DatabaseOperations<T> {
    aggregate(pipeline: any[]): Promise<any[]>
    countAll(): Promise<number>
    create(data: Partial<T>): Promise<T>
    deleteOne(filter: Filter, userUid: string): Promise<void>
    deleteOneByTitle(title: string, userUid: string): Promise<void>
    existsByTitle(title: string): Promise<boolean>
    find(filter: Filter, sort?: Sort): Promise<T[]>
    findAll(): Promise<T[]>
    findOne(filter: Filter): Promise<T | null>
    findOneById(id: string): Promise<T | null>
    findOneByTitle(title: string): Promise<T | null>
    updateOne(filter: Filter, update: UpdateQuery<T>): Promise<T | null>
    updateOneById(id: string, update: UpdateQuery<T>): Promise<T | null>
}

/**
 * The BaseRepository is a repository of methods on top of a specific collection.
 *? Example: `await new BaseRepository('News').find()` would return all News items in the database
 *
 * This uses the Repository Pattern: https://medium.com/@pererikbergman/repository-design-pattern-e28c0f3e4a30
 */
export class BaseRepository<T> implements DatabaseOperations<T> {
    protected connectionPromise: Promise<DatabaseConnection>

    constructor(
        protected collection: string,
        protected titleProperty: string = 'title'
    ) {
        this.connectionPromise = connectionPromise
    }

    async aggregate<U>(pipeline: any[]): Promise<U[]> {
        const db = await this.connectionPromise
        const results = await db
            .collection(this.collection)
            .aggregate(pipeline, { allowDiskUse: true }) // TODO: remove this after history is moved to another collection
            .toArray()

        return this.makeSafeObjectIDs(results as U[])
    }

    /**
     * Counts all unique documents in the collection
     */
    async countAll(): Promise<number> {
        const result = await this.aggregate<{
            count: number
        }>([
            { $group: { _id: '$' + this.titleProperty } },
            { $group: { _id: null, count: { $sum: 1 } } },
        ])

        return result[0]?.count ?? 0
    }

    /**
     * Creates a new document and returns it
     */
    async create(data: Partial<T>): Promise<T> {
        const db = await this.connectionPromise
        const { insertedId } = await db.collection(this.collection).insertOne(data)

        return this.findOneById(insertedId)
    }

    async deleteOne(filter: Filter, userUid: string): Promise<void> {
        const db = await this.connectionPromise
        return db.collection(this.collection).updateMany(
            {
                ...filter,
                // don't allow deleting already deleted documents to avoid losing the original user that deleted them
                'x-meditor.deletedOn': {
                    $exists: false,
                },
            },
            {
                $set: {
                    'x-meditor.deletedOn': new Date().toISOString(),
                    'x-meditor.deletedBy': userUid,
                },
            }
        )
    }

    /**
     * Soft deletes a document by it's title
     */
    async deleteOneByTitle(title: string, userUid: string): Promise<void> {
        return this.deleteOne({ [this.titleProperty]: title }, userUid)
    }

    /**
     * A lightweight check if a document exists, filtering out "deleted" documents
     */
    async existsByTitle(title: string): Promise<boolean> {
        const result = await this.findOneByTitle(title)
        return !!result
    }

    /**
     * Finds documents in the collection by a given filter and optional sort
     */
    async find(filter: Filter = {}, sort?: Sort): Promise<T[]> {
        return this.aggregate<T>([
            ...this.noDeletedDocumentsQuery(),
            filter,
            ...this.latestVersionOfDocumentQuery(),
            ...(sort && [{ $sort: sort }]),
        ])
    }

    /**
     * Finds ALL documents in the collection, including all versions and deleted documents
     */
    async findAll(): Promise<T[]> {
        const db = await this.connectionPromise
        return db.collection(this.collection).find().toArray()
    }

    /**
     * Finds the requested document matching the provided filter
     */
    async findOne(filter: Filter): Promise<T | null> {
        const [document] = await this.find(filter)
        return document
    }

    /**
     * Finds a document by a given database id
     */
    async findOneById(id: string): Promise<T | null> {
        return this.findOne({
            $match: {
                _id: id,
            },
        })
    }

    /**
     * Finds a document by it's title
     */
    async findOneByTitle(title: string): Promise<T | null> {
        return this.findOne({
            $match: {
                [this.titleProperty]: title,
            },
        })
    }

    async updateOne(filter: Filter, update: UpdateQuery<T>): Promise<T | null> {
        const db = await this.connectionPromise

        await db.collection(this.collection).updateOne(filter, update)

        return db.collection(this.collection).findOne(filter)
    }

    async updateOneById(id: string, update: UpdateQuery<T>): Promise<T | null> {
        return this.updateOne(
            {
                _id: (await this.connectionPromise).ObjectId(id),
            },
            update
        )
    }

    /**
     * mEditor stores all versions of all documents in the same collection, so we just want to grab the latest version of each document
     */
    protected latestVersionOfDocumentQuery() {
        return [
            // Sort descending by version (date)
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            // Grab all fields in the most recent version
            { $group: { _id: `$${this.titleProperty}`, doc: { $first: '$$ROOT' } } },
            // Put all fields of the most recent doc back into root of the document
            { $replaceRoot: { newRoot: '$doc' } },
        ]
    }

    protected noDeletedDocumentsQuery() {
        return [{ $match: { 'x-meditor.deletedOn': { $exists: false } } }]
    }

    /**
     * Next doesn't know how to process the Mongo _id property, as it's an object, not a string. So this hack parses ahead of time
     * https://github.com/vercel/next.js/issues/11993
     */
    protected makeSafeObjectIDs(
        records: Record<string, any> | Record<string, any>[] | WithId<Document> | null
    ) {
        return !!records ? JSON.parse(JSON.stringify(records)) : records
    }
}
