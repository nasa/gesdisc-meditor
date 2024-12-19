import exampleNews from './db-seed/example-news.json'
import models from './db-seed/models.json'
import workflows from './db-seed/workflows.json'
import { getDb } from '../lib/connections'
import type { Db } from 'mongodb'
import type { UserDuringSetup } from './types'

class SetupDb {
    #EXAMPLE_NEWS_COLLECTION = 'Example News'
    #MODELS_COLLECTION = 'Models'
    #USERS_COLLECTION = 'Users'
    #WORKFLOWS_COLLECTION = 'Workflows'
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async seedDb(users: UserDuringSetup[]): Promise<void> {
        const ISO_DATE = new Date().toISOString()

        const defaultRoles = ['Models', 'Workflows', 'Users', 'Example News'].map(
            model => ({
                model,
                role: 'Author',
            })
        )

        const usersWithMetadata = users.map(user => ({
            id: user.uid,
            name: user.name,
            roles: defaultRoles,
            'x-meditor': {
                model: 'Users',
                modifiedOn: ISO_DATE,
                modifiedBy: 'system',
                states: [
                    {
                        source: 'Init',
                        target: 'Draft',
                        modifiedOn: ISO_DATE,
                    },
                ],
            },
        }))

        await this.#db
            .collection(this.#USERS_COLLECTION)
            .insertMany(usersWithMetadata)
        await this.#db.collection(this.#MODELS_COLLECTION).insertMany(models)
        await this.#db.collection(this.#WORKFLOWS_COLLECTION).insertMany(workflows)
        await this.#db
            .collection(this.#EXAMPLE_NEWS_COLLECTION)
            .insertMany(exampleNews)
    }
}

const db = new SetupDb()

async function getSetupDb() {
    await db.connect(getDb)

    return db
}

export { getSetupDb }
