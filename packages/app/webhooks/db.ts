import { getDb } from '../lib/connections'
import { makeSafeObjectIDs } from '../lib/mongodb'
import type { Db } from 'mongodb'
import { WebhookDbDocument } from './types'

class WebhooksDb {
    #db: Db
    #COLLECTION = 'Webhooks'
    #successIndexName = 'webhook_results_success'
    #successTtlSeconds = 10
    #timeoutIndexName = 'webhook_results_timeout'
    // #timeoutTtlSeconds = 60 * 60 * 24 * 30 * 3 // roughly 90 days in seconds
    #timeoutTtlSeconds = 30

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getWebhooks(): Promise<WebhookDbDocument[]> {
        const webhooks = await this.#db.collection(this.#COLLECTION).find().toArray()

        return makeSafeObjectIDs(webhooks)
    }

    async getWebhook(uid: WebhookDbDocument['uid']): Promise<WebhookDbDocument> {
        const [webhook] = await this.#db
            .collection(this.#COLLECTION)
            .find({ uid: uid })
            .toArray()

        return makeSafeObjectIDs(webhook)
    }

    async upsertResult(payload: WebhookDbDocument) {
        const query = { uid: payload.uid }
        const operation = { $set: { ...payload, updatedAt: new Date() } }

        const { modifiedCount, upsertedCount } = await this.#db
            .collection(this.#COLLECTION)
            .updateOne(query, operation, { upsert: true })

        //TODO: throw error if not modifiedCount or upsertedCount

        await this.maybeCreatePartialTTLIndices()

        return { modifiedCount, upsertedCount }
    }

    async getRandomFailedWebhook(): Promise<WebhookDbDocument> {
        const pipeline = [
            {
                $match: {
                    statusCode: { $gte: 300 }, // non-200 status code
                },
            },
            { $sample: { size: 1 } }, // narrow down to one random document (why get stuck on the same failure?)
        ]

        const [oneDocument] = await this.#db
            .collection(this.#COLLECTION)
            .aggregate(pipeline)
            .toArray()

        return makeSafeObjectIDs(oneDocument)
    }
    /**
     * Webhook documents are set to expire with a TTL index. This means that MongoDB handles removing stale webhook documents. To stay unexpired, collaborator records must be updated more frequently than the TTL.
     * In MongoDB ^4.12.1, creating an index requires that the collection already exist. Unlike other update operations, this does not happen automatically.
     */
    async maybeCreatePartialTTLIndices() {
        const indices = await this.#db.collection(this.#COLLECTION).indexes()

        if (
            !indices.find(index => {
                return index.name === this.#successIndexName
            })
        ) {
            await this.#db.collection(this.#COLLECTION).createIndex(
                { updatedAt: 1 },
                {
                    expireAfterSeconds: this.#successTtlSeconds,
                    name: this.#successIndexName,
                    // Invariant: any document with an HTTP success status code should not be stored permanently
                    partialFilterExpression: { statusCode: { $lt: 300 } },
                }
            )
        }

        if (
            !indices.find(index => {
                return index.name === this.#timeoutIndexName
            })
        ) {
            await this.#db.collection(this.#COLLECTION).createIndex(
                { updatedAt: 1 },
                {
                    expireAfterSeconds: this.#timeoutTtlSeconds,
                    name: this.#timeoutIndexName,
                    // Invariant: any document that timed out should not be stored permanently.
                    partialFilterExpression: { isTimeout: { $eq: true } },
                }
            )
        }
    }
}

const db = new WebhooksDb()

async function getWebhooksDb() {
    await db.connect(getDb)

    return db
}

export { getWebhooksDb }
