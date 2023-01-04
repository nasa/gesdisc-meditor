import type { Db, UpdateResult } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import type { Document } from './types'

/**
 * Contains legacy code in need of a refactor, but the refactor requires more than the current scope of the current effort.
 *
 * Optimized for delete-ability.
 */
class DocumentsDbLegacy {
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getAllCollectionRecordsForModel(documentTitle: any): Promise<Document[]> {
        const allRecordsInCollection = this.#db
            .collection<Document>(documentTitle)
            .find()
            .toArray()

        return allRecordsInCollection
    }

    async getModelWithMaybePrevious(documentTitle: string): Promise<Document[]> {
        const pipeline = [
            { $match: { name: documentTitle } },
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            {
                $addFields: {
                    'x-meditor.state': {
                        $arrayElemAt: ['$x-meditor.states.target', -1],
                    },
                },
            },
            { $limit: 2 },
        ]

        const maybeTwoEntries = await this.#db
            .collection('Models')
            .aggregate(pipeline, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(maybeTwoEntries)
    }

    async getModelWorkflows(workflowNames: string[]): Promise<Document[]> {
        const pipeline = [
            { $match: { name: { $in: workflowNames } } },
            { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
            { $group: { _id: '$name', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
            { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
        ]

        const modelWorkflows = await this.#db
            .collection('Workflows')
            .aggregate(pipeline, { allowDiskUse: true })
            .sort({ 'x-meditor.modifiedOn': -1 })
            .toArray()

        return makeSafeObjectIDs(modelWorkflows)
    }

    async updateHistory(
        documentTitle: string,
        id: string,
        newStateHistory: any,
        oldHistory: any
    ): Promise<UpdateResult> {
        const result = this.#db.collection(documentTitle).updateOne(
            { _id: id },
            {
                $set: {
                    'x-meditor.states': newStateHistory,
                    'x-meditor.backupStates': oldHistory,
                },
            }
        )

        return result
    }
}

const db = new DocumentsDbLegacy()

async function getDocumentsDbLegacy() {
    await db.connect(getDb)

    return db
}

export { getDocumentsDbLegacy }
