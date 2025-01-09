import { DatabaseConnection } from './types'
import { MongoConfig, MongoDBConnection } from './connections/mongodb'

export type DatabaseType = 'mongodb'

export class DatabaseConnectionFactory {
    static create(type: DatabaseType, config: MongoConfig): DatabaseConnection {
        switch (type) {
            case 'mongodb':
                return new MongoDBConnection(config as MongoConfig)
            default:
                throw new Error(`Unsupported database type: ${type}`)
        }
    }
}
