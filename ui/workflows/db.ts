import type { Db } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import type { Workflow } from './types'

export const WORKFLOWS_COLLECTION = 'Workflows'
export const WORKFLOWS_TITLE_PROPERTY = 'name'

class WorkflowsDb {
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getWorkflow(workflowName: string): Promise<Workflow> {
        const workflows = await this.#db
            .collection(WORKFLOWS_COLLECTION)
            .find({ [WORKFLOWS_TITLE_PROPERTY]: workflowName })
            .sort({ 'x-meditor.modifiedOn': -1 }) // get latest version of workflow
            .limit(1)
            .toArray()

        return makeSafeObjectIDs(workflows)[0]
    }
}

const db = new WorkflowsDb()

async function getWorkflowsDb() {
    await db.connect(getDb)

    return db
}

export { getWorkflowsDb }
