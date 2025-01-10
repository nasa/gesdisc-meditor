import { BaseRepository } from '../lib/database/base-repository'
import { User } from 'declarations'
import type { Document } from '../documents/types'
import type { Model, ModelWithWorkflow } from '../models/types'
import type { UserContactInformation } from './types'

const ACCOUNTS_COLLECTION = 'users-urs'

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super('Users', 'name')
    }

    async getUserIdsWithModelRoles(
        model: Model | ModelWithWorkflow,
        roles: string[]
    ) {
        if (!roles.length) {
            return []
        }

        const results = await this.aggregate<{
            ids: string[]
        }>([
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
        ])

        // return only the user ids from the response
        return results[0]?.ids ?? []
    }

    /**
     * given a list of mEditor users, fetches their contact information from the database
     * contact info includes: emailAddress, firstName, lastName, and uid
     */
    async getContactInformationForUsers(
        userIds: string[]
    ): Promise<UserContactInformation[]> {
        if (!userIds?.length) {
            return []
        }

        const db = await this.connectionPromise

        // We aren't using the repository here, because users-urs is a separate collection.
        // We're accessing the database directly
        // TODO: remove need for users-urs table to exist by moving email address to `Users` record
        return db
            .collection(ACCOUNTS_COLLECTION)
            .aggregate([
                { $match: { uid: { $in: userIds } } },
                {
                    $project: {
                        _id: 0,
                        emailAddress: 1,
                        firstName: 1,
                        lastName: 1,
                        uid: 1,
                    },
                },
            ])
            .toArray()
    }

    async createUserAccount(userContactInformation: UserContactInformation) {
        const db = await this.connectionPromise

        // We aren't using the repository here, because users-urs is a separate collection.
        // TODO: See TODO in `getContactInformationForUsers`
        return db.collection(ACCOUNTS_COLLECTION).updateOne(
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
        return this.findOne({
            id: uid,
        })
    }
}
