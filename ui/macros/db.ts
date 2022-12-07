import type { Db } from 'mongodb'
import getDb from '../lib/mongodb'

class MacrosDb {
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getUniqueFieldValues(
        fieldName: string,
        modelName: string,
        titleProperty: string
    ) {
        const documents = await this.#db
            .collection(modelName)
            .aggregate([
                { $match: { 'x-meditor.deletedOn': { $exists: false } } }, // Do not grab deleted documents.
                { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort so that later queries can get only the latest version.
                {
                    $group: {
                        _id: `$${titleProperty}`,
                        field: { $first: `$${fieldName}` },
                    },
                }, // Put only the first (see sort, above) desired field on the grouped document.
                { $sort: { field: 1 } }, // Sort for macro consumption.
            ])
            .toArray()

        return documents.map(document => document.field)
    }

    /**
     * returns a list of all possible user roles
     */
    async userRoles() {
        let roleList = []
        let workflows = await this.#db
            .collection('Models')
            .aggregate(
                [
                    {
                        $lookup: {
                            from: 'Workflows',
                            localField: 'workflow',
                            foreignField: 'name',
                            as: 'graph',
                        },
                    },
                    { $project: { _id: 0, name: 1, 'graph.roles': 1 } },
                    { $unwind: '$graph' },
                ],
                { allowDiskUse: true }
            )
            .toArray()
        workflows.forEach(workflow => {
            roleList = roleList.concat(workflow.graph.roles)
        })
        return roleList
    }
}

const db = new MacrosDb()

async function getMacrosDb() {
    await db.connect(getDb)

    return db
}

export { getMacrosDb }
