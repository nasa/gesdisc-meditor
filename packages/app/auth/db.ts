import { getDb } from '../lib/connections'
import { makeSafeObjectIDs } from '../lib/mongodb'
import type { Db } from 'mongodb'
import type { Document } from '../documents/types'
import type { Model, ModelWithWorkflow } from '../models/types'
import type { UserContactInformation } from './types'

class UsersDb {
    #USERS_COLLECTION = 'Users'
    #ACCOUNTS_COLLECTION = 'users-urs'
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getUserIdsWithModelRoles(
        model: Model | ModelWithWorkflow,
        roles: string[]
    ) {
        if (!roles.length) {
            return []
        }

        const pipeline = [
            { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
            { $group: { _id: '$id', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
            { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
            { $unwind: '$roles' },
            {
                $match: {
                    'roles.model': model.name,
                    'roles.role': { $in: roles },
                },
            },
            { $group: { _id: null, ids: { $addToSet: '$id' } } },
        ]

        const results = await this.#db
            .collection(this.#USERS_COLLECTION)
            .aggregate(pipeline, { allowDiskUse: true })
            .toArray()

        if (!results.length) {
            return []
        }

        // return only the user ids from the response
        return makeSafeObjectIDs(results[0]).ids as string[]
    }

    /**
     * given a list of mEditor users, fetches their contact information from the database
     * contact info includes: emailAddress, firstName, lastName, and uid
     */
    async getContactInformationForUsers(
        userIds: string[]
    ): Promise<UserContactInformation[]> {
        if (!userIds || !userIds.length) {
            return []
        }

        return this.#db
            .collection(this.#ACCOUNTS_COLLECTION)
            .find({ uid: { $in: userIds } })
            .project<UserContactInformation>({
                _id: 0,
                emailAddress: 1,
                firstName: 1,
                lastName: 1,
                uid: 1,
            })
            .toArray()
    }

    async createUserAccount(userContactInformation: UserContactInformation) {
        return await this.#db
            .collection<Document>(this.#ACCOUNTS_COLLECTION)
            .updateOne(
                {
                    uid: userContactInformation.uid,
                },
                {
                    $set: userContactInformation,
                },
                {
                    upsert: true,
                }
            )
    }

    async getMeditorUserByUid(uid: string): Promise<Document> {
        const user = await this.#db
            // the mEditor user record is a generic, dynamic document, like any other model's document (see the "Users" model)
            .collection<Document>(this.#USERS_COLLECTION)
            .findOne(
                {
                    id: uid,
                    'x-meditor.deletedOn': { $exists: false }, // filter out deleted users
                },
                { sort: { 'x-meditor.modifiedOn': -1 } }
            )

        return makeSafeObjectIDs(user)
    }
}

const db = new UsersDb()

async function getUsersDb() {
    await db.connect(getDb)

    return db
}

export { getUsersDb }
