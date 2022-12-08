import type { Db } from 'mongodb'
import getDb from '../lib/mongodb'

class MacrosDb {
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getUniqueFieldValues(fieldName: string, modelName: string) {
        const documents = await this.#db
            .collection(modelName)
            .aggregate([
                { $match: { 'x-meditor.deletedOn': { $exists: false } } }, // Do not grab deleted documents.
                { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort so that later queries can get only the latest version.
                {
                    $group: {
                        _id: `$${fieldName}`,
                        field: { $first: `$${fieldName}` },
                    },
                }, // Put only the first (see sort, above) desired field on the grouped document.
                { $sort: { field: 1 } }, // Sort for macro consumption.
            ])
            .toArray()

        return documents.map(document => document.field)
    }

    async getDependenciesByTitle(dependentField, modelName) {
        const documents = await this.#db
            .collection(modelName)
            .aggregate([
                { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
                { $group: { _id: '$title', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
                { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
                {
                    $project: {
                        _id: 0,
                        title: 1,
                        [dependentField]: 1,
                    },
                },
            ])
            .toArray()

        return documents
    }
}

const db = new MacrosDb()

async function getMacrosDb() {
    await db.connect(getDb)

    return db
}

export { getMacrosDb }
