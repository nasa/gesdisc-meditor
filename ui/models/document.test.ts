import { getDb } from '../lib/mongodb'
import { getDocumentsForModel } from './document'
import alertsModel from './__test__/fixtures/models/alerts.json'
import collectionMetadataModel from './__test__/fixtures/models/collection-metadata.json'
import GLDAS_CLM10SUBP_3H_001 from './__test__/fixtures/collection-metadata/GLDAS_CLM10SUBP_3H_001.json'
import OML1BRVG_003 from './__test__/fixtures/collection-metadata/OML1BRVG_003.json'
import SpatialSearchIssue from './__test__/fixtures/alerts/spatial_search_issue.json'
import { Db } from 'mongodb'

describe('Documents', () => {
    let db: Db

    beforeEach(async () => {
        db = await getDb()

        // insert test models
        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Models').insertOne(collectionMetadataModel)
    })

    afterEach(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Collection Metadata').deleteMany({})
        await db.collection('Alerts').deleteMany({})
    })

    it('should return a empty list of documents for a model with no documents', async () => {
        const documents = await getDocumentsForModel('Collection Metadata')

        expect(documents.length).toEqual(0)
    })

    it('should return a list of documents for a model that has documents', async () => {
        await db.collection('Alerts').insertOne(SpatialSearchIssue)
        await db.collection('Collection Metadata').insertOne(GLDAS_CLM10SUBP_3H_001)
        await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

        const alerts = await getDocumentsForModel('Alerts')
        const collections = await getDocumentsForModel('Collection Metadata')

        expect(alerts.length).toBe(1)
        expect(collections.length).toBe(2)
    })

    it('returned documents should include fields by default', async () => {
        await db.collection('Collection Metadata').insertOne(GLDAS_CLM10SUBP_3H_001)
        const collections = await getDocumentsForModel('Collection Metadata')

        expect(collections[0].Combined_EntryID).toEqual(
            GLDAS_CLM10SUBP_3H_001.Combined_EntryID
        )
        expect(collections[0].title).toEqual(GLDAS_CLM10SUBP_3H_001.Combined_EntryID)

        /*"title": "CAR_ARCTAS_L1C_1",
        "x-meditor": {
        "modifiedOn": "2022-04-02T23:01:29.875Z",
        "modifiedBy": "cloeser",
        "state": "Published",
        "targetStates": [
        "Deleted"
        ]
        }*/
    })

    it('should filter out documents if a Lucene query is passed in', async () => {
        await db.collection('Collection Metadata').insertOne(GLDAS_CLM10SUBP_3H_001)
        await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

        const collections = await getDocumentsForModel(
            'Collection Metadata',
            'Combined_EntryID:GLDAS_CLM10SUBP_3H_001'
        )

        expect(collections.length).toBe(1)
    })

    it('should throw for an improperly formatted filter', async () => {
        await expect(async () =>
            getDocumentsForModel('Collection Metadata', 'Improper query here')
        ).rejects.toThrowErrorMatchingInlineSnapshot(`"Improperly formatted filter"`)
    })

    it('should only return the latest version of a document', async () => {
        // create an old version
        let oldVersion = JSON.parse(JSON.stringify(GLDAS_CLM10SUBP_3H_001))
        oldVersion['x-meditor'].modifiedOn = '2018-01-01T00:00:00.000Z'

        await db.collection('Collection Metadata').insertOne(GLDAS_CLM10SUBP_3H_001)
        await db.collection('Collection Metadata').insertOne(oldVersion)
        await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

        const collections = await getDocumentsForModel('Collection Metadata')

        expect(collections.length).toBe(2)
        // check date to make sure we got the latest one
        expect(
            collections.find(c => c['Combined_EntryID'] == 'GLDAS_CLM10SUBP_3H_001')[
                'x-meditor'
            ].modifiedOn
        ).toEqual(GLDAS_CLM10SUBP_3H_001['x-meditor'].modifiedOn)
    })

    it('should not return any deleted documents', async () => {
        let deletedDocument = JSON.parse(JSON.stringify(GLDAS_CLM10SUBP_3H_001))
        deletedDocument['x-meditor'].deletedOn = '2018-01-01T00:00:00.000Z'

        await db.collection('Collection Metadata').insertOne(deletedDocument)
        await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

        const collections = await getDocumentsForModel('Collection Metadata')

        expect(collections.length).toBe(1)
    })

    it('should throw if model not passed in', async () => {
        await expect(async () =>
            // @ts-ignore intentionally ignore, we're testing runtime validation here
            getDocumentsForModel()
        ).rejects.toThrowErrorMatchingInlineSnapshot(`"Model name is required"`)
    })

    it('should throw for a model that does not exist', async () => {
        await expect(async () =>
            getDocumentsForModel('Foo')
        ).rejects.toThrowErrorMatchingInlineSnapshot(`"Model not found: Foo"`)
    })
})
