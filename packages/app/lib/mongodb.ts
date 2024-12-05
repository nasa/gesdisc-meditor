/**
 * MongoClient following the Vercel pattern
 * https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
 */

import { Document, MongoClient, WithId } from 'mongodb'
import log from './log'

const uri =
    (process.env.MONGO_URL ||
        process.env.MONGOURL ||
        'mongodb://meditor_database:27017/') + 'meditor'

let mongoClient: MongoClient

let mongoClientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!globalThis._mongoClientPromise) {
        log.info('Connecting to MongoDB (DEV): ', uri)

        mongoClient = new MongoClient(uri)
        // @ts-ignore in development
        global._mongoClientPromise = mongoClient.connect()
    }
    // @ts-ignore in development
    mongoClientPromise = global._mongoClientPromise
} else {
    log.info('Connecting to MongoDB: ', uri)

    // In production mode, it's best to not use a global variable.
    mongoClient = new MongoClient(uri)
    mongoClientPromise = mongoClient.connect()
}

const getDb = async (dbName?: string) => {
    return (await mongoClientPromise).db(dbName || process.env.DB_NAME)
}

// Next doesn't know how to process the Mongo _id property, as it's an object, not a string. So this hack parses ahead of time
// https://github.com/vercel/next.js/issues/11993
function makeSafeObjectIDs(
    records: Record<string, any> | Record<string, any>[] | WithId<Document> | null
) {
    return !!records ? JSON.parse(JSON.stringify(records)) : records
}

export { getDb as default, makeSafeObjectIDs, mongoClientPromise }
