import getDb from '../lib/mongodb'
import { macroFunctions } from './macros'
import alertsModel from './__test__/fixtures/models/alerts.json'
import collectionMetadataModel from './__test__/fixtures/models/collection-metadata.json'
import GLDAS_CLM10SUBP_3H_001 from './__test__/fixtures/collection-metadata/GLDAS_CLM10SUBP_3H_001.json'
import OML1BRVG_003 from './__test__/fixtures/collection-metadata/OML1BRVG_003.json'
import TEST_NO_STATE from './__test__/fixtures/collection-metadata/TEST_NO_STATE.json'

describe('Macros', () => {
    let db

    beforeEach(async () => {
        db = await getDb()

        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Models').insertOne(collectionMetadataModel)

        await db.collection('Collection Metadata').insertOne(GLDAS_CLM10SUBP_3H_001)
        await db.collection('Collection Metadata').insertOne(OML1BRVG_003)
        await db.collection('Collection Metadata').insertOne(TEST_NO_STATE)
    })

    afterEach(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Alerts').deleteMany({})
        await db.collection('Collection Metadata').deleteMany({})
    })

    describe('macro:list', () => {
        it('should return a list of all collection metadata documents in a model', async () => {
            const results = await macroFunctions.list([
                'Collection%20Metadata.Combined_EntryID',
            ])

            expect(results).toMatchInlineSnapshot(`
                Array [
                  "GLDAS_CLM10SUBP_3H_001",
                  "OML1BRVG_003",
                  "TEST_NO_STATE",
                ]
            `)
        })

        it('should return an empty list for a model that does not exist', async () => {
            const results = await macroFunctions.list(['Foo.title'])

            expect(results).toMatchInlineSnapshot(`Array []`)
        })

        it('should throw an error if the model contains white spaces', async () => {
            await expect(async () =>
                macroFunctions.list(['Collection Metadata.Combined_EntryID'])
            ).rejects.toThrowErrorMatchingInlineSnapshot(
                `"Error: collection name in \\"Collection Metadata.Combined_EntryID\\" should not have white spaces"`
            )
        })
    })
})
