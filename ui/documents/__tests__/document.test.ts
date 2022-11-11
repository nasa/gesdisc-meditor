import type { Db } from 'mongodb'
import getDb from '../../lib/mongodb'
import SpatialSearchIssue from '../../models/__test__/fixtures/alerts/spatial_search_issue.json'
import GLDAS_CLM10SUBP_3H_001 from '../../models/__test__/fixtures/collection-metadata/GLDAS_CLM10SUBP_3H_001.json'
import OML1BRVG_003 from '../../models/__test__/fixtures/collection-metadata/OML1BRVG_003.json'
import TEST_NO_STATE from '../../models/__test__/fixtures/collection-metadata/TEST_NO_STATE.json'
import alertsModel from '../../models/__test__/fixtures/models/alerts.json'
import collectionMetadataModel from '../../models/__test__/fixtures/models/collection-metadata.json'
import faqsModel from '../../models/__test__/fixtures/models/faqs.json'
import HowDoIFAQ from '../../models/__test__/fixtures/faqs/how-do-i.json'
import WhereDoIFAQ from '../../models/__test__/fixtures/faqs/where-do-i.json'
import editPublishCmrWorkflow from '../../workflows/__tests__/__fixtures__/edit-publish-cmr.json'
import editPublishWorkflow from '../../workflows/__tests__/__fixtures__/edit-publish.json'
import modifyReviewPublishWorkflow from '../../workflows/__tests__/__fixtures__/modify-review-publish.json'
import {
    changeDocumentState,
    getDocumentHistory,
    getDocumentHistoryByVersion,
    getDocumentPublications,
    getDocumentsForModel,
} from '../service'
import alertWithHistory from './__fixtures__/alertWithHistory.json'
import alertWithPublication from './__fixtures__/alertWithPublication.json'

describe('Documents', () => {
    let db: Db

    beforeEach(async () => {
        db = await getDb()

        // mongo for some reason mutates the original object after insert...
        delete (editPublishCmrWorkflow as any)._id
        delete (editPublishWorkflow as any)._id

        // insert test models
        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Models').insertOne(collectionMetadataModel)
        await db.collection('Models').insertOne(faqsModel)
        await db.collection('Workflows').insertOne(editPublishCmrWorkflow)
        await db.collection('Workflows').insertOne(editPublishWorkflow)
        await db.collection('Workflows').insertOne(modifyReviewPublishWorkflow)
    })

    afterEach(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Collection Metadata').deleteMany({})
        await db.collection('Alerts').deleteMany({})
        await db.collection('FAQs').deleteMany({})
        await db.collection('Workflows').deleteMany({})
    })

    describe('getDocumentsForModel', () => {
        it('should return a empty list of documents for a model with no documents', async () => {
            const [error, documents] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(documents.length).toEqual(0)
        })

        it('should return a list of documents for a model that has documents', async () => {
            await db.collection('Alerts').insertOne(SpatialSearchIssue)
            await db
                .collection('Collection Metadata')
                .insertOne(GLDAS_CLM10SUBP_3H_001)
            await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

            const [alertsError, alerts] = await getDocumentsForModel('Alerts')
            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(alerts.length).toBe(1)
            expect(collections.length).toBe(2)
        })

        it('returned documents with no state should have unspecified state added', async () => {
            await db.collection('Collection Metadata').insertOne(TEST_NO_STATE)

            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(collections[0]['x-meditor'].state).toEqual('Unspecified')
        })

        it('returned documents should include basic fields by default', async () => {
            await db
                .collection('Collection Metadata')
                .insertOne(GLDAS_CLM10SUBP_3H_001)

            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(collections[0]).toMatchInlineSnapshot(`
                Object {
                  "Combined_EntryID": "GLDAS_CLM10SUBP_3H_001",
                  "title": "GLDAS_CLM10SUBP_3H_001",
                  "x-meditor": Object {
                    "model": "Collection Metadata",
                    "modifiedBy": "jdoe",
                    "modifiedOn": "2022-04-03T02:00:45.335Z",
                    "publishedTo": Array [
                      Object {
                        "message": "Document was successfully published to UUI-OPS",
                        "publishedOn": 1649077649811,
                        "statusCode": 200,
                        "target": "uui",
                        "url": "https://disc.gsfc.nasa.gov/information/collection-metadata?title=GLDAS_CLM10SUBP_3H_001",
                      },
                      Object {
                        "message": "Document GLDAS_CLM10SUBP_3H_001 with concept Id C1279404074-GES_DISC at revision 27 was published to CMR-PROD",
                        "publishedOn": 1649077649852,
                        "statusCode": 200,
                        "target": "cmr",
                      },
                    ],
                    "state": "Published",
                    "states": Array [
                      Object {
                        "modifiedOn": null,
                        "source": "Init",
                        "target": "Draft",
                      },
                      Object {
                        "modifiedBy": "jdoe",
                        "modifiedOn": "2022-04-04T13:07:27.815Z",
                        "source": "Draft",
                        "target": "Published",
                      },
                    ],
                    "targetStates": Array [
                      "Deleted",
                    ],
                  },
                }
            `)
        })

        it('should filter out documents if a Lucene query is passed in', async () => {
            await db
                .collection('Collection Metadata')
                .insertOne(GLDAS_CLM10SUBP_3H_001)
            await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata',
                {
                    filter: 'Combined_EntryID:GLDAS_CLM10SUBP_3H_001',
                }
            )

            expect(collections.length).toBe(1)
        })

        it.todo('should search for documents if a search term is passed in') // tests fail, upgrade Mongo to newer version

        it('should sort documents by modifiedOn desc if no sort is passed in', async () => {
            await db.collection('Collection Metadata').insertOne({
                ...GLDAS_CLM10SUBP_3H_001,
                'x-meditor': {
                    ...GLDAS_CLM10SUBP_3H_001['x-meditor'],
                    modifiedOn: '2000-01-01T00:00:00.000Z',
                },
            })

            await db.collection('Collection Metadata').insertOne({
                ...OML1BRVG_003,
                'x-meditor': {
                    ...OML1BRVG_003['x-meditor'],
                    modifiedOn: '2000-02-01T00:00:00.000Z',
                },
            })

            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(collections.map(collection => collection.title)).toEqual([
                'OML1BRVG_003',
                'GLDAS_CLM10SUBP_3H_001',
            ])
        })

        interface DocumentSortToExpected {
            collection: string
            sort: string
            expectedTitlesInOrder: string[]
        }

        test.each`
            collection               | sort                       | expectedTitlesInOrder
            ${'Collection Metadata'} | ${'-x-meditor.modifiedOn'} | ${['OML1BRVG_003', 'GLDAS_CLM10SUBP_3H_001']}
            ${'Collection Metadata'} | ${'x-meditor.modifiedOn'}  | ${['GLDAS_CLM10SUBP_3H_001', 'OML1BRVG_003']}
            ${'Collection Metadata'} | ${'-Combined_EntryID'}     | ${['OML1BRVG_003', 'GLDAS_CLM10SUBP_3H_001']}
            ${'Collection Metadata'} | ${'Combined_EntryID'}      | ${['GLDAS_CLM10SUBP_3H_001', 'OML1BRVG_003']}
        `(
            'should return target states of `$expectedTargetStates` for a document in `$documentState` state of the workflow `$workflowName`',
            async ({
                collection,
                sort,
                expectedTitlesInOrder,
            }: DocumentSortToExpected) => {
                await db.collection('Collection Metadata').insertOne({
                    ...GLDAS_CLM10SUBP_3H_001,
                    'x-meditor': {
                        ...GLDAS_CLM10SUBP_3H_001['x-meditor'],
                        modifiedOn: '2000-01-01T00:00:00.000Z',
                    },
                })

                await db.collection('Collection Metadata').insertOne({
                    ...OML1BRVG_003,
                    'x-meditor': {
                        ...OML1BRVG_003['x-meditor'],
                        modifiedOn: '2000-02-01T00:00:00.000Z',
                    },
                })

                const [collectionsError, collections] = await getDocumentsForModel(
                    collection,
                    {
                        sort,
                    }
                )

                expect(collections.map(collection => collection.title)).toEqual(
                    expectedTitlesInOrder
                )
            }
        )

        it('should throw for an improperly formatted filter', async () => {
            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata',
                {
                    filter: 'Improper query here',
                }
            )

            expect(collectionsError).toMatchInlineSnapshot(
                `[Error: Improperly formatted filter]`
            )
        })

        it('should only return the latest version of a document', async () => {
            // create an old version
            let oldVersion = JSON.parse(JSON.stringify(GLDAS_CLM10SUBP_3H_001))
            oldVersion['x-meditor'].modifiedOn = '2018-01-01T00:00:00.000Z'

            await db
                .collection('Collection Metadata')
                .insertOne(GLDAS_CLM10SUBP_3H_001)
            await db.collection('Collection Metadata').insertOne(oldVersion)
            await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(collections.length).toBe(2)
            // check date to make sure we got the latest one
            expect(
                collections.find(
                    c => c['Combined_EntryID'] == 'GLDAS_CLM10SUBP_3H_001'
                )['x-meditor'].modifiedOn
            ).toEqual(GLDAS_CLM10SUBP_3H_001['x-meditor'].modifiedOn)
        })

        it('should not return any deleted documents', async () => {
            let deletedDocument = JSON.parse(JSON.stringify(GLDAS_CLM10SUBP_3H_001))
            deletedDocument['x-meditor'].deletedOn = '2018-01-01T00:00:00.000Z'

            await db.collection('Collection Metadata').insertOne(deletedDocument)
            await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(collections.length).toBe(1)
        })
    })

    describe('getDocumentHistory', () => {
        test('returns document history', async () => {
            await db.collection('Alerts').insertMany(alertWithHistory)

            const [error, history] = await getDocumentHistory(
                'Reprocessed FLDAS Data',
                'Alerts'
            )

            expect(history).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "modifiedBy": "jdoe",
                    "modifiedOn": "2018-08-09T14:26:07.541Z",
                    "state": "Published",
                    "states": Array [
                      Object {
                        "modifiedOn": "2018-08-09T14:26:07.541Z",
                        "source": "Approved",
                        "target": "Published",
                      },
                    ],
                  },
                  Object {
                    "modifiedBy": "jdoe",
                    "modifiedOn": "2018-08-09T14:26:07.538Z",
                    "state": "Draft",
                    "states": Array [],
                  },
                  Object {
                    "modifiedBy": "jdoe",
                    "modifiedOn": "2018-08-09T14:25:10.834Z",
                    "state": "Draft",
                    "states": Array [],
                  },
                  Object {
                    "modifiedBy": "jdoe",
                    "modifiedOn": "2018-08-09T14:25:09.384Z",
                    "state": "Draft",
                    "states": Array [],
                  },
                ]
            `)
        })
    })

    describe('getDocumentHistoryByVersion', () => {
        test('returns document history', async () => {
            await db.collection('Alerts').insertMany(alertWithHistory)

            const [error, history] = await getDocumentHistory(
                'Reprocessed FLDAS Data',
                'Alerts'
            )

            const [lastHistory] = history.slice(-1)

            const [versionError, versionHistory] = await getDocumentHistoryByVersion(
                lastHistory.modifiedOn,
                'Reprocessed FLDAS Data',
                'Alerts'
            )

            expect(versionHistory).toMatchInlineSnapshot(`
                Object {
                  "modifiedBy": "jdoe",
                  "modifiedOn": "2018-08-09T14:25:09.384Z",
                  "state": "Draft",
                  "states": Array [],
                }
            `)
        })
    })

    describe('getDocumentPublications', () => {
        test('returns document publications', async () => {
            await db.collection('Alerts').insertOne(alertWithPublication)

            const [error, publications] = await getDocumentPublications(
                'Issue with derived carbon monoxide mass mixing ratio from the CLIMCAPS processing system',
                'Alerts'
            )

            expect(publications).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "message": "Document was successfully published to UUI-OPS",
                    "publishedOn": 1666203423780,
                    "statusCode": 200,
                    "target": "uui",
                    "url": "http://www.example.com",
                  },
                ]
            `)
        })
    })

    describe('changeDocumentState', () => {
        beforeEach(async () => {
            await db.collection('FAQs').insertOne(HowDoIFAQ)
            await db.collection('FAQs').insertOne(WhereDoIFAQ)
        })

        afterEach(async () => {
            await db.collection('FAQs').deleteMany({})
        })

        it('returns an error for a model that does not exist', async () => {
            const [error, document] = await changeDocumentState(
                'Bacon',
                'Eggs',
                'Foo'
            )
            expect(error).toMatchInlineSnapshot(`[Error: Model not found: Eggs]`)
            expect(document).toBeNull()
        })

        it('returns an error for a document that does not exist', async () => {
            const [error, document] = await changeDocumentState(
                'Bacon',
                'FAQs',
                'Foo'
            )
            expect(error).toMatchInlineSnapshot(
                `[Error: Document, Bacon, in model, FAQs, does not exist]`
            )
            expect(document).toBeNull()
        })

        it('returns an error if the state is not provided', async () => {
            // @ts-expect-error
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs'
            )
            expect(error).toMatchInlineSnapshot(`[Error: No state provided]`)
            expect(document).toBeNull()
        })

        it('returns an error if the provided state is the same as the current document state', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Draft'
            )
            expect(error).toMatchInlineSnapshot(
                `[Error: Cannot transition to state [Draft] as the document is in this state already]`
            )
            expect(document).toBeNull()
        })

        it('returns an error if the state is not a valid state in the workflow', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Foo'
            )
            expect(error).toMatchInlineSnapshot(
                `[Error: Cannot transition to state [Foo] as it is not a valid state in the workflow]`
            )
            expect(document).toBeNull()
        })
    })
})
