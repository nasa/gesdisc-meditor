import { getDb } from '../lib/mongodb'
import { getModel, getModels, getModelsWithDocumentCount } from './model'
import alertsModel from './__test__/fixtures/models/alerts.json'
import collectionMetadataModel from './__test__/fixtures/models/collection-metadata.json'
import GLDAS_CLM10SUBP_3H_001 from './__test__/fixtures/collection-metadata/GLDAS_CLM10SUBP_3H_001.json'
import OML1BRVG_003 from './__test__/fixtures/collection-metadata/OML1BRVG_003.json'

describe('Model', () => {
    let db

    beforeAll(async () => {
        db = await getDb()

        // create an old version of the collection metadata model
        // we'll use this to make sure we're getting latest versions only
        let oldCollectionMetadataVersion = JSON.parse(
            JSON.stringify(collectionMetadataModel)
        )
        oldCollectionMetadataVersion['x-meditor'].modifiedOn =
            '2018-01-01T00:00:00.000Z'

        // insert test models
        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Models').insertOne(collectionMetadataModel)
        await db.collection('Models').insertOne(oldCollectionMetadataVersion)
    })

    afterAll(async () => {
        // cleanup
        await db.collection('Models').deleteMany({})
        await db.collection('Collection Metadata').deleteMany({})
    })

    describe('getModel', () => {
        it('should return the requested models', async () => {
            expect(await getModel('Alerts')).toEqual(alertsModel)
            expect(await getModel('Collection Metadata')).toEqual(
                collectionMetadataModel
            )
        })

        it('should throw if model not passed in', async () => {
            await expect(async () =>
                // @ts-ignore intentionally ignore, we're testing runtime validation here
                getModel()
            ).rejects.toThrowErrorMatchingInlineSnapshot(`"Model name is required"`)
        })

        it('should throw for a model that does not exist', async () => {
            await expect(async () =>
                getModel('Foo')
            ).rejects.toThrowErrorMatchingInlineSnapshot(`"Model not found: Foo"`)
        })
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

    describe('getModelsWithDocumentCount', () => {
        beforeEach(async () => {
            await db
                .collection('Collection Metadata')
                .insertOne(GLDAS_CLM10SUBP_3H_001)
            await db.collection('Collection Metadata').insertOne(OML1BRVG_003)
        })

        test('returns zero count for models without documents', async () => {
            // we want to test with no documents, so clear the collection metadata out
            await db.collection('Collection Metadata').deleteMany({})

            const models = await getModelsWithDocumentCount()
            const alerts = models.find(model => model.name == 'Alerts')
            const collectionMetadata = models.find(
                model => model.name == 'Collection Metadata'
            )

            expect(models.length).toBe(2)
            expect(alerts['x-meditor'].count).toEqual(0)
            expect(alerts['x-meditor'].countAll).toEqual(0)
            expect(collectionMetadata['x-meditor'].count).toEqual(0)
            expect(collectionMetadata['x-meditor'].countAll).toEqual(0)
        })

        test('returns a document count for models with documents', async () => {
            const models = await getModelsWithDocumentCount()
            const alerts = models.find(model => model.name == 'Alerts')
            const collectionMetadata = models.find(
                model => model.name == 'Collection Metadata'
            )

            expect(models.length).toBe(2)
            expect(alerts['x-meditor'].count).toEqual(0)
            expect(alerts['x-meditor'].countAll).toEqual(0)
            expect(collectionMetadata['x-meditor'].count).toEqual(2)
            expect(collectionMetadata['x-meditor'].countAll).toEqual(2)
        })
    })
})
