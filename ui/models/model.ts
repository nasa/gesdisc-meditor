import mongoClient from '../lib/mongodb'
import { Model } from './types'

export async function getModels(): Promise<Model[]> {
    const client = await mongoClient
    const db = client.db('meditor')

    // get a list of all models
    return (await db
        .collection('Models')
        .aggregate(
            [
                { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
                { $group: { _id: '$name', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
                { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
            ],
            { allowDiskUse: true }
        )
        .toArray()) as Model[]
}

export async function getModelsWithDocumentCount(): Promise<Model[]> {
    const client = await mongoClient
    const db = client.db('meditor')
    const models = await getModels()

    // get a count of documents in each model
    return await Promise.all(
        models.map(async model => {
            const countResult = await db
                .collection(model.name)
                .aggregate(
                    [
                        { $group: { _id: '$' + model.titleProperty } },
                        { $group: { _id: null, count: { $sum: 1 } } },
                    ],
                    { allowDiskUse: true }
                )
                .toArray()

            return {
                ...model,
                'x-meditor': {
                    ...model['x-meditor'],
                    count: countResult[0]?.count || 0,
                },
            } as Model
        })
    )
}
