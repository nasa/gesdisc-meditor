import type { Db } from 'mongodb'
import * as emailNotifications from '../../email-notifications/service'
import getDb from '../../lib/mongodb'
import SpatialSearchIssue from '../../models/__tests__/__fixtures__/alerts/spatial_search_issue.json'
import GLDAS_CLM10SUBP_3H_001 from '../../models/__tests__/__fixtures__/collection-metadata/GLDAS_CLM10SUBP_3H_001.json'
import OML1BRVG_003 from '../../models/__tests__/__fixtures__/collection-metadata/OML1BRVG_003.json'
import TEST_NO_STATE from '../../models/__tests__/__fixtures__/collection-metadata/TEST_NO_STATE.json'
import HowDoIFAQ from '../../models/__tests__/__fixtures__/faqs/how-do-i.json'
import WhereDoIFAQ from '../../models/__tests__/__fixtures__/faqs/where-do-i.json'
import alertsModel from '../../models/__tests__/__fixtures__/models/alerts.json'
import collectionMetadataModel from '../../models/__tests__/__fixtures__/models/collection-metadata.json'
import faqsModel from '../../models/__tests__/__fixtures__/models/faqs.json'
import modelsModel from '../../models/__tests__/__fixtures__/models/models.json'
import * as publicationQueue from '../../publication-queue/service'
import { wait } from '../../utils/time'
import editPublishCmrWorkflow from '../../workflows/__tests__/__fixtures__/edit-publish-cmr.json'
import editPublishWorkflow from '../../workflows/__tests__/__fixtures__/edit-publish.json'
import editReviewPublishWorkflow from '../../workflows/__tests__/__fixtures__/edit-review-publish.json'
import modifyReviewPublishWorkflow from '../../workflows/__tests__/__fixtures__/modify-review-publish.json'
import { adaptDocumentToLegacyDocument } from '../adapters'
import {
    changeDocumentState,
    cloneDocument,
    createDocument,
    createSourceToTargetStateMap,
    findAllowedUserRolesForModel,
    getDocument,
    getDocumentHistory,
    getDocumentHistoryByVersion,
    getDocumentPublications,
    getDocumentsForModel,
    isPublishableWithWorkflowSupport,
    strictValidateDocument,
} from '../service'
import alertFromGql from './__fixtures__/alertFromGql.json'
import alertOnlyDocument from './__fixtures__/alertOnlyDocument.json'
import alertsAfterCreateDocumentModification from './__fixtures__/alerts-after-createDocument-modifies-state.json'
import alertsAfterV1Modification from './__fixtures__/alerts-after-v1-putDocument-modifies-state.json'
import alertsBeforeModification from './__fixtures__/alerts-before-modified-state.json'
import alertWithHistory from './__fixtures__/alertWithHistory.json'
import alertWithPublication from './__fixtures__/alertWithPublication.json'
import duplicateEdgesWorkflow from './__fixtures__/duplicate-edges-workflow.json'
import workflowWithTwoInitialNodes from './__fixtures__/workflow-with-two-initial-nodes.json'
import workflowEdges from './__fixtures__/workflowEdges.json'

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
        await db.collection('Models').insertOne(modelsModel)
        await db.collection('Workflows').insertOne(editPublishCmrWorkflow)
        await db.collection('Workflows').insertOne(editPublishWorkflow)
        await db.collection('Workflows').insertOne(modifyReviewPublishWorkflow)
        await db.collection('Workflows').insertOne(duplicateEdgesWorkflow)
        await db.collection('Workflows').insertOne(editReviewPublishWorkflow)
        await db.collection('Alerts').insertMany(alertsBeforeModification)
    })

    afterEach(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Collection Metadata').deleteMany({})
        await db.collection('Alerts').deleteMany({})
        await db.collection('FAQs').deleteMany({})
        await db.collection('Workflows').deleteMany({})
    })

    describe('createDocument', () => {
        const queueSpy = jest.spyOn<typeof publicationQueue, any>(
            publicationQueue,
            'publishMessageToQueueChannel'
        )

        queueSpy.mockImplementation(async () => {
            return Promise.resolve()
        })

        afterEach(async () => {
            queueSpy.mockClear()
        })

        const minimalAlert = {
            'x-meditor': {
                model: 'Alerts',
                modifiedOn: '',
                modifiedBy: '',
                states: [],
            },
            title: 'Year 2038 Problem',
            body: '<p>JS epoch / Unix time will overflow.</p>\n',
            expiration: '2038-01-19T03:04:07Z',
            severity: 'normal',
            start: '1111-11-11T11:11:11Z',
            tags: [],
            datasets: [],
            notes: '',
        }

        const user = {
            id: 'a-db-id',
            uid: 'johndoe',
            created: 1052283628409,
            emailAddress: 'john.r.doe@example.com',
            firstName: 'John',
            lastAccessed: 1000000000000,
            lastName: 'Doe',
            roles: [
                { model: 'Models', role: 'Author' },
                { model: 'Workflows', role: 'Author' },
                { model: 'Users', role: 'Author' },
                { model: 'Images', role: 'Author' },
                { model: 'News', role: 'Author' },
                { model: 'News', role: 'Reviewer' },
                { model: 'Tags', role: 'Author' },
            ],
            name: 'John Doe',
        }

        test('modifies related documents when a Model is edited', async () => {
            const alertModel = await db
                .collection('Models')
                .findOne({ name: 'Alerts' })
            const allAlertsBeforeTestModification = await db
                .collection('Alerts')
                .find()
                .sort({ modifiedOn: -1 })
                .toArray()

            const originalFixtureStates = alertsBeforeModification.map(alert => {
                return alert['x-meditor'].states
            })
            const originalTestStates = allAlertsBeforeTestModification.map(alert => {
                return alert['x-meditor'].states
            })
            const statesAfterV1Modification = alertsAfterV1Modification.map(alert => {
                return alert['x-meditor'].states
            })
            const statesAfterCreateDocumentModification =
                alertsAfterCreateDocumentModification.map(alert => {
                    return alert['x-meditor'].states
                })

            //* This baseline assertion shows that nothing was modified up to this point: the fixture (inserted into the test DB) equals the result of querying the test DB.
            expect(originalFixtureStates).toStrictEqual(originalTestStates)
            //* This asserts that the manual testing I ran (from which these two fixtures were created) means that, for Alerts, changing the workflow from 'Edit-Publish' to 'Edit-Review-Publish' netted the same result in the legacy code as in the current code.
            expect(statesAfterCreateDocumentModification).toStrictEqual(
                statesAfterV1Modification
            )

            //* Sets up a baseline assertion for the original workflow.
            expect(alertModel.workflow).toBe('Edit-Publish')
            alertModel.workflow = 'Edit-Review-Publish'
            //* Asserting that the modification worked.
            expect(alertModel.workflow).toBe('Edit-Review-Publish')

            //* Prevents conflicting ObjectID upon insertion.
            delete alertModel._id
            //* This should modify all Alerts, since we're changing the Alerts model's workflow.
            const [error, insertedDocument] = await createDocument(
                alertModel,
                'Models',
                user
            )

            const allAlertsAfterTestModification = await db
                .collection('Alerts')
                .find()
                .sort({ modifiedOn: -1 })
                .toArray()
            const statesAfterTestModification = allAlertsAfterTestModification.map(
                alert => {
                    return alert['x-meditor'].states
                }
            )

            //* Even though we asserted their equality previously, we're gong to explicitly compare our test DB results with both fixture results.
            expect(statesAfterTestModification).toStrictEqual(
                statesAfterV1Modification
            )
            expect(statesAfterTestModification).toStrictEqual(
                statesAfterCreateDocumentModification
            )
        })

        test('creates a new document for create or update operations', async () => {
            const baselineCount = await db.collection('Alerts').countDocuments()
            expect(await db.collection('Alerts').countDocuments()).toBe(baselineCount)

            const [firstError, { insertedDocument: firstInsertedAlert }] =
                await createDocument(minimalAlert, 'Alerts', user)
            //* Normalize by deleting properties that will always have a time-based fresh value.
            delete firstInsertedAlert._id
            delete firstInsertedAlert['x-meditor'].modifiedOn
            //* Since change e3876fb4f226e6f0e84e24095e295dfea687089b we set the `modifiedOn` property of a document's root state.
            firstInsertedAlert['x-meditor'].states.forEach(
                stateEntry => delete stateEntry.modifiedOn
            )

            expect(firstInsertedAlert).toMatchSnapshot()
            expect(await db.collection('Alerts').countDocuments()).toBe(11)

            //* Modify the alert, keeping the same "title", which is what determines a unique record for mEditor.
            firstInsertedAlert.notes = 'This has been called the Epochalypse.'
            const [secondError, { insertedDocument: secondInsertedAlert }] =
                await createDocument(firstInsertedAlert, 'Alerts', user)

            //* Normalize by deleting properties that will always have a time-based fresh value.
            delete secondInsertedAlert._id
            delete secondInsertedAlert['x-meditor'].modifiedOn
            //* Since change e3876fb4f226e6f0e84e24095e295dfea687089b we set the `modifiedOn` property of a document's root state.
            secondInsertedAlert['x-meditor'].states.forEach(
                stateEntry => delete stateEntry.modifiedOn
            )

            expect(secondInsertedAlert).toMatchSnapshot()
            expect(await db.collection('Alerts').countDocuments()).toBe(
                baselineCount + 2
            )
        })

        test('attempts to publish document change to queue', async () => {
            const [error, { insertedDocument }] = await createDocument(
                minimalAlert,
                'Alerts',
                user
            )

            expect(queueSpy).toHaveBeenCalledTimes(1)
        })

        test('allow creating with an initial state other than `Draft`', async () => {
            const modelName = 'Testing Two Initial Nodes'
            const { _id: _modelId, ...model } = alertsModel as any
            const { _id: _documentId, ...document } = minimalAlert as any

            await db.collection('Workflows').insertOne(workflowWithTwoInitialNodes)
            await db.collection('Models').insertOne({
                ...model,
                name: modelName,
                workflow: workflowWithTwoInitialNodes.name,
            })

            const [error, { insertedDocument }] = await createDocument(
                document,
                modelName,
                user,
                'Another Init Node'
            )

            expect(error).toBeNull()
            expect(insertedDocument['x-meditor'].states[0].target).toEqual(
                'Another Init Node'
            )
        })

        test('should throw an error if initial state does not exist', async () => {
            const modelName = 'Testing Two Initial Nodes'
            const { _id: _modelId, ...model } = alertsModel as any
            const { _id: _documentId, ...document } = minimalAlert as any

            await db.collection('Workflows').insertOne(workflowWithTwoInitialNodes)
            await db.collection('Models').insertOne({
                ...model,
                name: modelName,
                workflow: workflowWithTwoInitialNodes.name,
            })

            const [error] = await createDocument(document, modelName, user, 'Foo')

            expect(error).toMatchInlineSnapshot(
                `[Error: The passed in state, Foo, does not exist]`
            )
        })

        test('should throw an error if passed in state is not actually an initial state', async () => {
            const modelName = 'Testing Two Initial Nodes'
            const { _id: _modelId, ...model } = alertsModel as any
            const { _id: _documentId, ...document } = minimalAlert as any

            await db.collection('Workflows').insertOne(workflowWithTwoInitialNodes)
            await db.collection('Models').insertOne({
                ...model,
                name: modelName,
                workflow: workflowWithTwoInitialNodes.name,
            })

            const [error] = await createDocument(
                document,
                modelName,
                user,
                'Published'
            )

            expect(error).toMatchInlineSnapshot(
                `[Error: The passed in state, Published, is not an initial node in the workflow]`
            )
        })
    })

    describe('findAllowedUserRolesForModel', () => {
        test(`returns only matching roles`, () => {
            const userRoles = [
                { model: 'Alerts', role: 'Author' },
                { model: 'News', role: 'Reviewer' },
                { model: 'Alerts', role: 'Publisher' },
            ]
            const allowedRoles = findAllowedUserRolesForModel('Alerts', userRoles)

            expect(allowedRoles).toMatchInlineSnapshot(`
                Array [
                  "Author",
                  "Publisher",
                ]
            `)
        })

        test(`is case sensitive`, () => {
            const userRoles = [
                { model: 'alerts', role: 'Author' },
                { model: 'News', role: 'Reviewer' },
                { model: 'Alerts', role: 'publisher' },
            ]
            const allowedRoles = findAllowedUserRolesForModel('Alerts', userRoles)

            expect(allowedRoles).toMatchInlineSnapshot(`
                Array [
                  "publisher",
                ]
            `)
        })
    })

    describe('createSourceToTargetStateMap', () => {
        test('returns matching state map', () => {
            expect(createSourceToTargetStateMap(['Author'], workflowEdges))
                .toMatchInlineSnapshot(`
                Object {
                  "Draft": Array [
                    "Under Review",
                    "Deleted",
                  ],
                  "Init": Array [
                    "Draft",
                  ],
                }
            `)

            expect(createSourceToTargetStateMap(['Publisher'], workflowEdges))
                .toMatchInlineSnapshot(`
                Object {
                  "Approved": Array [
                    "Published",
                    "Under Review",
                  ],
                  "Hidden": Array [
                    "Published",
                    "Deleted",
                  ],
                  "Published": Array [
                    "Hidden",
                  ],
                }
            `)

            expect(
                createSourceToTargetStateMap(['Admin'], workflowEdges)
            ).toMatchInlineSnapshot(`Object {}`)
        })
    })

    describe('getDocument', () => {
        const user = {
            id: 'a-db-id',
            uid: 'johndoe',
            created: 1052283628409,
            emailAddress: 'john.r.doe@example.com',
            firstName: 'John',
            lastAccessed: 1000000000000,
            lastName: 'Doe',
            roles: [
                { model: 'Models', role: 'Author' },
                { model: 'Workflows', role: 'Author' },
                { model: 'Users', role: 'Author' },
                { model: 'Images', role: 'Author' },
                { model: 'News', role: 'Author' },
                { model: 'News', role: 'Reviewer' },
                { model: 'Tags', role: 'Author' },
            ],
            name: 'John Doe',
        }

        test('returns document', async () => {
            await db.collection('Alerts').insertMany(alertWithHistory)

            const [error, { _id, ...document }] = await getDocument(
                'Reprocessed FLDAS Data',
                'Alerts',
                user
            )

            expect(error).toBeNull()
            expect(document).toMatchSnapshot()
        })

        test('returns document at version', async () => {
            await db.collection('Alerts').insertMany(alertWithHistory)

            const [error, { _id, ...document }] = await getDocument(
                'Reprocessed FLDAS Data',
                'Alerts',
                user,
                '2018-08-09T14:25:09.384Z'
            )

            expect(error).toBeNull()
            expect(document).toMatchSnapshot()
        })

        describe('adaptDocumentToLegacyDocument', () => {
            test('is identical to the previous data structure returned from GQL', async () => {
                await db.collection('Alerts').insertMany(alertWithHistory)

                const [error, { _id, ...document }] = await getDocument(
                    'Reprocessed FLDAS Data',
                    'Alerts',
                    user
                )

                const adaptedDocument = adaptDocumentToLegacyDocument(document)

                expect(error).toBeNull()
                //* I modified the alertFromGql to anonymize the data, remove the __typeName field, and equalize date formatting from ":00.000Z" to ":00Z".
                expect(adaptedDocument).toEqual(alertFromGql)
            })
        })
    })

    describe('getDocumentsForModel', () => {
        it('should return a empty list of documents for a model with no documents', async () => {
            const [error, documents] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(documents.length).toEqual(0)
        })

        it('should return a list of documents for a model that has documents', async () => {
            const baselineLength = await db.collection('Alerts').countDocuments()
            await db.collection('Alerts').insertOne(SpatialSearchIssue)
            await db
                .collection('Collection Metadata')
                .insertOne(GLDAS_CLM10SUBP_3H_001)
            await db.collection('Collection Metadata').insertOne(OML1BRVG_003)

            const [alertsError, alerts] = await getDocumentsForModel('Alerts')
            const [collectionsError, collections] = await getDocumentsForModel(
                'Collection Metadata'
            )

            expect(alerts.length).toBe(baselineLength + 1)
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
        const notificationsSpy = jest.spyOn<typeof emailNotifications, any>(
            emailNotifications,
            'constructEmailMessageForStateChange'
        )

        const queueSpy = jest.spyOn<typeof publicationQueue, any>(
            publicationQueue,
            'publishMessageToQueueChannel'
        )

        const user_noFAQRole = {
            id: 'a-db-id',
            uid: 'johndoe',
            created: 1052283628409,
            emailAddress: 'john.r.doe@example.com',
            firstName: 'John',
            lastAccessed: 1000000000000,
            lastName: 'Doe',
            roles: [
                { model: 'Models', role: 'Author' },
                { model: 'Workflows', role: 'Author' },
                { model: 'Users', role: 'Author' },
                { model: 'Images', role: 'Author' },
                { model: 'News', role: 'Author' },
                { model: 'News', role: 'Reviewer' },
                { model: 'Tags', role: 'Author' },
            ],
            name: 'John Doe',
        }

        const user_FAQAuthorAndReviewer = {
            ...user_noFAQRole,
            roles: [].concat(user_noFAQRole.roles, [
                { model: 'FAQs', role: 'Author' },
                { model: 'FAQs', role: 'Reviewer' },
            ]),
        }

        beforeEach(async () => {
            await db.collection('FAQs').insertOne(HowDoIFAQ)
            await db.collection('FAQs').insertOne(WhereDoIFAQ)

            // mock the notifications service to return a test email
            notificationsSpy.mockImplementation(async () => {
                return {
                    subject: 'a test email',
                }
            })

            // mock the queue service so we don't actually queue up an email!
            queueSpy.mockImplementation(async () => {
                return 'foo'
            })
        })

        afterEach(async () => {
            await db.collection('FAQs').deleteMany({})

            notificationsSpy.mockClear()
            queueSpy.mockClear()
        })

        it('returns an error for a model that does not exist', async () => {
            const [error, document] = await changeDocumentState(
                'Bacon',
                'Eggs',
                'Foo',
                user_noFAQRole
            )
            expect(error).toMatchInlineSnapshot(`[Error: Model not found: Eggs]`)
            expect(document).toBeNull()
        })

        it('returns an error for a document that does not exist', async () => {
            const [error, document] = await changeDocumentState(
                'Bacon',
                'FAQs',
                'Foo',
                user_noFAQRole
            )
            expect(error).toMatchInlineSnapshot(
                `[Error: Requested document, Bacon, in model, FAQs, was not found]`
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
                'Draft',
                user_noFAQRole
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
                'Foo',
                user_noFAQRole
            )
            expect(error).toMatchInlineSnapshot(
                `[Error: Cannot transition to state [Foo] as it is not a valid state in the workflow]`
            )
            expect(document).toBeNull()
        })

        it('returns an error if the user does not have the appropriate role', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_noFAQRole
            )
            expect(error).toMatchInlineSnapshot(
                `[Error: User does not have the permissions to transition to state Under Review.]`
            )
            expect(document).toBeNull()
        })

        it('should transition Draft -> Under Review if user has Author role', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_FAQAuthorAndReviewer
            )
            expect(error).toBeNull()
            expect(document).toHaveProperty('_id')
            expect(document['x-meditor'].state).toEqual('Under Review')
        })

        it('should return an error if user tries to Approve a document that same user submitted for review (no consecutive transitions)', async () => {
            // first submit for review
            const [reviewError, reviewDocument] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_FAQAuthorAndReviewer
            )

            expect(reviewError).toBeNull()
            expect(reviewDocument['x-meditor'].state).toEqual('Under Review')

            // then try to approve it
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Approved',
                user_FAQAuthorAndReviewer
            )

            expect(error).toMatchInlineSnapshot(
                `[Error: User does not have the permissions to transition to state Approved.]`
            )
            expect(document).toBeNull()
        })

        it('should return an error if the workflow has duplicate edges', async () => {
            // reset FAQs to have an invalid workflow
            await db.collection('Models').deleteMany({ name: faqsModel.name })
            await db.collection('Models').insertOne({
                ...faqsModel,
                workflow: duplicateEdgesWorkflow.name,
            })

            // because there are multiple edges to get to "Under Review", we should get an error here
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_FAQAuthorAndReviewer
            )

            expect(document).toBeNull()
            expect(error).toMatchInlineSnapshot(
                `[Error: Workflow, Duplicate Edges, is misconfigured! There are duplicate edges from 'Draft' to 'Under Review'.]`
            )
        })

        it('should send an email notification by default', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_FAQAuthorAndReviewer,
                { disableQueuePublication: true }
            )

            expect(error).toBeNull()
            expect(document).not.toBeNull()
            expect(notificationsSpy).toHaveBeenCalledTimes(1)
        })

        it('should not send an email notification if requested to disable', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_FAQAuthorAndReviewer,
                { disableEmailNotifications: true, disableQueuePublication: true }
            )

            expect(error).toBeNull()
            expect(document).not.toBeNull()
            expect(notificationsSpy).toHaveBeenCalledTimes(0)
        })

        it('should publish the email message to the publication queue', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_FAQAuthorAndReviewer,
                { disableQueuePublication: true }
            )

            expect(error).toBeNull()
            expect(document).not.toBeNull()
            expect(queueSpy).toHaveBeenCalledTimes(1)
            expect(queueSpy).toHaveBeenCalledWith('meditor-notifications-test', {
                subject: 'a test email',
            })
        })

        it('should not publish the email message to the publication queue, if requested to disable notifications', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_FAQAuthorAndReviewer,
                { disableEmailNotifications: true, disableQueuePublication: true }
            )

            expect(error).toBeNull()
            expect(document).not.toBeNull()
            expect(queueSpy).toHaveBeenCalledTimes(0)
        })

        it('should publish the state change to the queue by default', async () => {
            const [error, document] = await changeDocumentState(
                HowDoIFAQ.title,
                'FAQs',
                'Under Review',
                user_FAQAuthorAndReviewer,
                { disableEmailNotifications: true }
            )

            expect(error).toBeNull()
            expect(document).not.toBeNull()

            //* Publishing is a side effect; we do not await it in our code.
            await wait(1000)
            expect(queueSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('shouldPublishStateChangeToQueue', () => {
        it('should return true if no nodes in the workflow are set to publishable', () => {
            const model1: any = {
                workflow: {
                    nodes: [],
                },
            }

            const model2: any = {
                workflow: {
                    nodes: [
                        {
                            id: 'Under Review',
                        },
                    ],
                },
            }

            expect(isPublishableWithWorkflowSupport(model1, 'Under Review')).toEqual(
                true
            )
            expect(isPublishableWithWorkflowSupport(model2, 'Under Review')).toEqual(
                true
            )
        })

        it('should return true if workflow has publishable nodes and the node matching the state is publishable', () => {
            const model1: any = {
                workflow: {
                    nodes: [
                        {
                            id: 'Published',
                            publishable: true,
                        },
                    ],
                },
            }

            const model2: any = {
                workflow: {
                    nodes: [
                        {
                            id: 'Published',
                            publishable: false,
                        },
                        {
                            id: 'Under Review',
                            publishable: true,
                        },
                    ],
                },
            }

            expect(isPublishableWithWorkflowSupport(model1, 'Under Review')).toEqual(
                true
            )
            expect(isPublishableWithWorkflowSupport(model2, 'Under Review')).toEqual(
                true
            )
        })

        it('should return false if workflow has publishable nodes AND the node matching the state has publishable === false', () => {
            const model: any = {
                workflow: {
                    nodes: [
                        {
                            id: 'Published',
                            publishable: true,
                        },
                        {
                            id: 'Under Review',
                            publishable: false,
                        },
                    ],
                },
            }

            expect(isPublishableWithWorkflowSupport(model, 'Under Review')).toEqual(
                false
            )
        })
    })

    describe('cloneDocument', () => {
        const user_noFAQRole = {
            id: 'a-db-id',
            uid: 'johndoe',
            created: 1052283628409,
            emailAddress: 'john.r.doe@example.com',
            firstName: 'John',
            lastAccessed: 1000000000000,
            lastName: 'Doe',
            roles: [],
            name: 'John Doe',
        }

        const user_FAQAuthor = {
            ...user_noFAQRole,
            roles: [].concat(user_noFAQRole.roles, [
                { model: 'FAQs', role: 'Author' },
            ]),
        }

        beforeEach(async () => {
            await db.collection('FAQs').insertOne(HowDoIFAQ)
            await db.collection('FAQs').insertOne(WhereDoIFAQ)
        })

        afterEach(async () => {
            await db.collection('FAQs').deleteMany({})
        })

        it('should require user authentication', async () => {
            // @ts-expect-error
            const [error, document] = await cloneDocument('Bacon', 'Eggs', 'FAQs')

            expect(error).toMatchInlineSnapshot(`[Error: User is not authenticated]`)
            expect(document).toBeNull()
        })

        it('should return an error if the original document does not exist', async () => {
            const [error, document] = await cloneDocument(
                'Bacon',
                'Eggs',
                'FAQs',
                user_FAQAuthor
            )

            expect(error).toMatchInlineSnapshot(
                `[Error: Requested document, Bacon, in model, FAQs, was not found]`
            )
            expect(document).toBeNull()
        })

        it('should return an error if a document with the new title already exists', async () => {
            const [error, document] = await cloneDocument(
                HowDoIFAQ.title,
                WhereDoIFAQ.title,
                'FAQs',
                user_FAQAuthor
            )

            expect(error).toMatchInlineSnapshot(
                `[Error: A document already exists with the title: 'Where do I?']`
            )
            expect(document).toBeNull()
        })

        it('should clone the requested document using the new title', async () => {
            const [error, result] = await cloneDocument(
                HowDoIFAQ.title,
                'Eggs',
                'FAQs',
                user_FAQAuthor
            )

            expect(error).toBeNull()
            expect(result.insertedDocument).toBeDefined()
            expect(result.insertedDocument.title).toEqual('Eggs') // make sure the title was changed

            const [cloneError, clone] = await getDocument(
                'Eggs',
                'FAQs',
                user_FAQAuthor
            )

            expect(cloneError).toBeNull()
            expect(clone).toBeDefined()
            expect(clone.title).toEqual('Eggs')
        })
    })

    describe('validateDocument', () => {
        it(`returns no error and the original document when validation passes`, async () => {
            const [error, document] = await strictValidateDocument(
                alertOnlyDocument,
                'Alerts'
            )

            expect(error).toBeNull()
            expect(document).toEqual(alertOnlyDocument)
        })

        it(`returns errors and no document when validation fails`, async () => {
            const docClone = JSON.parse(JSON.stringify(alertOnlyDocument)) //* structuredClone requires NodeJS > 17
            docClone.severity = 'pretty serious'

            const [error, document] = await strictValidateDocument(docClone, 'Alerts')

            expect(error).toMatchInlineSnapshot(
                `[Error: Document "Forward stream data temporarily unavailable from AWS cloud" does not validate against the schema for model "Alerts": [{"property":"instance.severity","name":"enum","argument":["normal","emergency"],"message":"is not one of enum values","stack":"instance.severity is not one of enum values"}]]`
            )
            expect(document).toBeNull()
        })

        it(`does not allow additional properties`, async () => {
            const docWithMetadata = await db
                .collection('Alerts')
                .findOne({ title: 'TRMM GrADS DODS Server' })

            const [error, document] = await strictValidateDocument(
                docWithMetadata,
                'Alerts'
            )

            expect(error).toMatchInlineSnapshot(
                `[Error: Document "TRMM GrADS DODS Server" does not validate against the schema for model "Alerts": [{"property":"instance","name":"additionalProperties","argument":"_id","message":"is not allowed to have the additional property \\"_id\\"","stack":"instance is not allowed to have the additional property \\"_id\\""},{"property":"instance","name":"additionalProperties","argument":"x-meditor","message":"is not allowed to have the additional property \\"x-meditor\\"","stack":"instance is not allowed to have the additional property \\"x-meditor\\""}]]`
            )
            expect(document).toBeNull()
        })
    })
})
