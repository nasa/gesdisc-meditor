import type { Collaborator } from './types'
import type { Db } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import { ErrorCode, HttpException } from 'utils/errors'

class CollaboratorsDb {
    #COLLECTION = 'Collaborators'
    #db: Db
    // Use a short duration so that collaborators are removed quickly when they close the page.
    #durationSeconds = 10
    #indexName = 'active_collaborators'

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    /**
     * Collaborator documents are set to expire with a TTL index. This means that MongoDB handles removing stale collaborators. To stay unexpired, collaborator records must be updated more frequently than the TTL.
     * In MongoDB ^4.12.1, creating an index requires that the collection already exist. Unlike other update operations, this does not happen automatically.
     */
    async maybeCreateTTLIndex() {
        const indices = await this.#db.collection(this.#COLLECTION).indexes()
        const index = indices.find(index => {
            return index.name === this.#indexName
        })

        if (!index) {
            await this.#db.collection(this.#COLLECTION).createIndex(
                { updatedAt: 1 },
                {
                    expireAfterSeconds: this.#durationSeconds,
                    name: this.#indexName,
                }
            )
        }
    }

    async upsertDocumentCollaborator(
        collaborator: Collaborator,
        documentTitle: string,
        modelName: string
    ) {
        const query = { uid: collaborator.uid }
        const operation = {
            $set: {
                documentModelTitle: `${modelName}_${documentTitle}`,
                firstName: collaborator.firstName,
                hasBeenActive: collaborator.hasBeenActive,
                initials: collaborator.initials,
                isActive: collaborator.isActive,
                lastName: collaborator.lastName,
                uid: collaborator.uid,
                updatedAt: new Date(),
            },
        }

        const { modifiedCount, upsertedCount } = await this.#db
            .collection(this.#COLLECTION)
            .updateOne(query, operation, { upsert: true })

        if (!(modifiedCount || upsertedCount)) {
            throw new HttpException(
                ErrorCode.InternalServerError,
                'Failed to update the collaborator.'
            )
        }

        await this.maybeCreateTTLIndex()
        return await this.getDocumentCollaborators(documentTitle, modelName)
    }

    async getDocumentCollaborators(documentTitle: string, modelName: string) {
        const query = { documentModelTitle: `${modelName}_${documentTitle}` }

        const results = await this.#db
            .collection(this.#COLLECTION)
            .find(query)
            .toArray()

        return makeSafeObjectIDs(results) ?? []
    }
}

const db = new CollaboratorsDb()

async function getCollaboratorsDb() {
    await db.connect(getDb)

    return db
}

export { getCollaboratorsDb }
