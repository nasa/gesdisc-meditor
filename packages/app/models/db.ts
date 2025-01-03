import { getDb } from '../lib/connections'
import { makeSafeObjectIDs } from '../lib/mongodb'
import type { Db } from 'mongodb'
import type { Model } from './types'

export const MODELS_COLLECTION = 'Models'
export const MODELS_TITLE_PROPERTY = 'name'

class ModelsDb {
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getModel(modelName: string): Promise<Model> {
        const models = await this.#db
            .collection(MODELS_COLLECTION)
            .find({ [MODELS_TITLE_PROPERTY]: modelName })
            .sort({ 'x-meditor.modifiedOn': -1 })
            .limit(1)
            .toArray()

        return makeSafeObjectIDs(models)[0]
    }

    async getModels(): Promise<Model[]> {
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
}

const db = new ModelsDb()

async function getModelsDb() {
    await db.connect(getDb)

    return db
}

export { getModelsDb }
