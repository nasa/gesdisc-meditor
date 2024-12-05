import { DatabaseRepositoryInterface } from './types'
import { MongoRepository } from './repositories/mongo.repository'
import log from 'lib/log'
import { MongoClient } from 'mongodb'

export async function getDatabaseRepository<T>(): Promise<
    DatabaseRepositoryInterface<T>
> {
    const type = process.env.DB_CONNECTION ?? 'mongo'

    if (type === 'mongo') {
        const client = await getMongoClient()
        return new MongoRepository<T>(client)
    }

    throw new Error(`Unsupported repository type: ${type}`)
}

async function getMongoClient(): Promise<MongoClient> {
    const uri = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

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

    return mongoClientPromise
}
