import log from './log'
import { DatabaseConnection } from './database/types'
import { Document, WithId } from 'mongodb'
import {
    DatabaseConnectionFactory,
    DatabaseType,
} from './database/connection-factory'

const uri =
    (process.env.MONGO_URL ||
        process.env.MONGOURL ||
        'mongodb://meditor_database:27017/') + 'meditor'

export async function createDatabaseConnection() {
    const config = {
        type: (process.env.DB_TYPE ?? 'mongodb') as DatabaseType,
        mongodb: {
            uri,
            dbName: process.env.DB_NAME,
            options: {
                maxPoolSize: 10,
            },
        },
    }

    const connection = DatabaseConnectionFactory.create(
        config.type,
        config[config.type]
    )

    await connection.connect()
    return connection
}

let connectionPromise: Promise<DatabaseConnection>

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!globalThis._mongoClientPromise) {
        log.info('Connecting to MongoDB (DEV): ', uri)

        global._connectionPromise = createDatabaseConnection()
    }

    connectionPromise = global._connectionPromise
} else {
    log.info('Connecting to MongoDB: ', uri)

    // In production mode, it's best to not use a global variable.
    connectionPromise = createDatabaseConnection()
}

const getDb = async (dbName?: string) => {
    return await connectionPromise
}

// Next doesn't know how to process the Mongo _id property, as it's an object, not a string. So this hack parses ahead of time
// https://github.com/vercel/next.js/issues/11993
function makeSafeObjectIDs(
    records: Record<string, any> | Record<string, any>[] | WithId<Document> | null
) {
    return !!records ? JSON.parse(JSON.stringify(records)) : records
}

export { getDb, makeSafeObjectIDs, connectionPromise }
