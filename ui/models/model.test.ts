import mongoClient from '../lib/mongodb'
import { getModels } from './model'
import alertsModel from './__test__/fixtures/models/alerts.json'
import collectionMetadataModel from './__test__/fixtures/models/collection-metadata.json'

describe('Model', () => {
    let client
    let db

    beforeAll(async () => {
        client = await mongoClient
        db = client.db(process.env.DB_NAME)

        // create an old version of the collection metadata model
        // we'll use this to make sure we're getting latest versions only
        const oldCollectionMetadataVersion = {
            ...collectionMetadataModel,
            'x-meditor': {
                ...collectionMetadataModel['x-meditor'],
                modifiedOn: '2018-01-01T00:00:00.000Z',
            },
        }

        // insert test models
        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Models').insertOne(collectionMetadataModel)
        await db.collection('Models').insertOne(oldCollectionMetadataVersion)
    })

    afterAll(async () => {
        await db.collection('Models').deleteMany({}) // cleanup
    })

    describe('getModels', () => {
        test('returns latest version of all models', async () => {
            const models = await getModels()

            expect(models.length).toBe(2)
            expect(
                // version retrieved is the latest version
                models.find(model => model.name == 'Collection Metadata')['x-meditor']
                    .modifiedOn
            ).toEqual(collectionMetadataModel['x-meditor'].modifiedOn)
        })
    })
})
