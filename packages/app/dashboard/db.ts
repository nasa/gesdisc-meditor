import type { Db } from 'mongodb'
import getDb from '../lib/mongodb'

class DashboardDb {
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }
}

const db = new DashboardDb()

async function getDashboardDb() {
    await db.connect(getDb)

    return db
}

export { getDashboardDb }
