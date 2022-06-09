/**
 * MongoClient following the Vercel pattern
 * https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
 */

import { MongoClient, MongoClientOptions } from 'mongodb'

const uri =
    process.env.MONGO_URL ||
    process.env.MONGOURL ||
    'mongodb://meditor_database:27017/'
const options: MongoClientOptions = {
    useUnifiedTopology: true,
}

let mongoClient: MongoClient
let mongoClientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!globalThis._mongoClientPromise) {
        mongoClient = new MongoClient(uri, options)
        // @ts-ignore in development
        global._mongoClientPromise = mongoClient.connect()
    }
    // @ts-ignore in development
    mongoClientPromise = global._mongoClientPromise
} else {
    // In production mode, it's best to not use a global variable.
    mongoClient = new MongoClient(uri, options)
    mongoClientPromise = mongoClient.connect()
}

export const getDb = async (dbName?: string) => {
    return (await mongoClientPromise).db(dbName || process.env.DB_NAME)
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default mongoClientPromise
