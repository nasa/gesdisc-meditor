import { DatabaseConnection } from '../types'
import { Db, MongoClient, ObjectId } from 'mongodb'

export interface MongoConfig {
    uri: string
    dbName?: string
    options?: {
        maxPoolSize?: number
        retryWrites?: boolean
        retryReads?: boolean
    }
}

export class MongoDBConnection implements DatabaseConnection {
    private client: MongoClient | null = null
    private db: Db | null = null

    constructor(private readonly config: MongoConfig) {}

    async connect(): Promise<void> {
        if (!this.client) {
            this.client = await MongoClient.connect(this.config.uri, {
                maxPoolSize: this.config.options?.maxPoolSize || 10,
                retryWrites: this.config.options?.retryWrites ?? true,
                retryReads: this.config.options?.retryReads ?? true,
            })
            this.db = this.client.db(this.config.dbName)
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close()
            this.client = null
            this.db = null
        }
    }

    collection(name: string): any {
        if (!this.db) {
            throw new Error('Database not connected')
        }
        return this.db.collection(name)
    }

    ObjectId(id: string): ObjectId {
        return new ObjectId(id)
    }
}
