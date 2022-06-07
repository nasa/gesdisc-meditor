import mongoClient from '../lib/mongodb'
import { sortModels } from '../utils/sort'

export type ModelCategory = {
    name: string
    models: Model[]
}

export type Model = {
    _id: string
    name: string
    description: string
    icon: ModelIcon
    titleProperty: string
    schema: string
    layout: string
    'x-meditor'?: any // TODO: review
    category?: string
    workflow?: string
}

export type ModelIcon = {
    name: string
    color: string
}

export async function getModelCategories(): Promise<ModelCategory[]> {
    // get all models
    const models = (await getModelsWithDocumentCount()).sort(sortModels)

    // get a unique list of category names
    const categories: string[] = models
        // retrieve just the category name
        .map(model => model.category)
        // remove duplicates
        .filter(
            (category, index, categories) => categories.indexOf(category) === index
        )

    return categories.map(category => ({
        name: category,
        models: models.filter(model => model.category === category),
    }))
}

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
                    countAll: countResult[0]?.count || 0,

                    // this was originally a role-based count, but any role can see any document so it's always the same as countAll
                    // was able to greatly improve performance by just reusing the full count
                    count: countResult[0]?.count || 0,
                },
            } as Model
        })
    )
}
