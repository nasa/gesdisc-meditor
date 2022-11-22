import type { Db } from 'mongodb'
import getDb from '../../lib/mongodb'
import {
    getTargetStatesFromWorkflow,
    getWorkflow,
    getWorkflowEdgeMatchingSourceAndTarget,
    getWorkflowForModel,
    getWorkflowNodeAndEdgesForState,
} from '../service'
import editPublishCmrWorkflow from './__fixtures__/edit-publish-cmr.json'
import editPublishWorkflow from './__fixtures__/edit-publish.json'
import modifyReviewPublishWorkflow from './__fixtures__/modify-review-publish.json'
import collectionMetadataModel from '../../models/__test__/fixtures/models/collection-metadata.json'

describe('Workflows', () => {
    let db: Db

    beforeAll(async () => {
        db = await getDb()

        await db.collection('Models').insertOne(collectionMetadataModel)
        await db.collection('Workflows').insertOne(editPublishCmrWorkflow)
        await db.collection('Workflows').insertOne(editPublishWorkflow)
        await db.collection('Workflows').insertOne(modifyReviewPublishWorkflow)
    })

    afterAll(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Workflows').deleteMany({})
    })

    describe('getWorkflowForModel', () => {
        it('should get for the requested model', async () => {
            const [error, workflow] = await getWorkflowForModel('Collection Metadata')

            expect(error).toBeNull()
            expect(workflow.name).toEqual(editPublishCmrWorkflow.name)
        })
    })

    describe('getWorkflow', () => {
        it('returns the requested workflow', async () => {
            const [error, workflow] = await getWorkflow('Edit-Publish-CMR')

            expect(error).toBeNull()
            expect(workflow.name).toEqual(editPublishCmrWorkflow.name)
        })

        it('should return an error for a workflow that does not exist', async () => {
            const [error, workflow] = await getWorkflow('Foo')

            expect(error).toMatchInlineSnapshot(
                `[Error: The requested workflow, Foo, was not found.]`
            )
            expect(workflow).toBeNull()
        })
    })

    describe('getTargetStatesFromWorkflow', () => {
        interface DocumentStateToExpectedTargets {
            documentState: string
            workflowName: string
            expectedTargetStates: string[]
        }

        test.each`
            documentState     | workflowName                     | expectedTargetStates
            ${'Init'}         | ${'editPublishCmrWorkflow'}      | ${['Draft']}
            ${'Draft'}        | ${'editPublishCmrWorkflow'}      | ${['Published', 'Deleted']}
            ${'Hidden'}       | ${'editPublishCmrWorkflow'}      | ${['Deleted']}
            ${'Published'}    | ${'editPublishCmrWorkflow'}      | ${['Deleted']}
            ${'Init'}         | ${'modifyReviewPublishWorkflow'} | ${['Draft']}
            ${'Draft'}        | ${'modifyReviewPublishWorkflow'} | ${['Under Review', 'Deleted']}
            ${'Under Review'} | ${'modifyReviewPublishWorkflow'} | ${['Draft', 'Approved']}
            ${'Approved'}     | ${'modifyReviewPublishWorkflow'} | ${['Published', 'Under Review']}
            ${'Published'}    | ${'modifyReviewPublishWorkflow'} | ${['Hidden', 'Deleted']}
            ${'Hidden'}       | ${'modifyReviewPublishWorkflow'} | ${['Published', 'Deleted', 'Deleted']}
        `(
            'should return target states of `$expectedTargetStates` for a document in `$documentState` state of the workflow `$workflowName`',
            ({
                documentState,
                workflowName,
                expectedTargetStates,
            }: DocumentStateToExpectedTargets) => {
                const workflows = {
                    editPublishCmrWorkflow,
                    modifyReviewPublishWorkflow,
                }
                const targetStates = getTargetStatesFromWorkflow(
                    documentState,
                    workflows[workflowName]
                )

                expect(targetStates).toEqual(expectedTargetStates)
            }
        )
    })

    describe('getWorkflowEdgeMatchingSourceAndTarget', () => {
        it('should throw an error if the requested edge in the workflow has a duplicate', () => {
            const workflow = {
                name: 'Bacon Workflow',
                edges: [
                    {
                        role: 'Author',
                        source: 'Draft',
                        target: 'Published',
                        label: 'Publish',
                    },
                    {
                        role: 'Author',
                        source: 'Draft',
                        target: 'Under Review',
                        label: 'Submit for Review',
                    },
                    // this is the duplicate edge
                    {
                        role: 'Publisher',
                        source: 'Draft',
                        target: 'Published',
                        label: 'Publish as Publisher',
                    },
                ],
            }

            expect(() => {
                getWorkflowEdgeMatchingSourceAndTarget(
                    workflow as any,
                    'Draft',
                    'Published'
                )
            }).toThrowErrorMatchingInlineSnapshot(
                `"The workflow, Bacon Workflow, is misconfigured due to having duplicate edges for [source=Draft, target=Published]."`
            )
        })

        it('should return the requested edge', () => {
            const workflow = {
                name: 'Bacon Workflow',
                edges: [
                    {
                        role: 'Author',
                        source: 'Draft',
                        target: 'Published',
                        label: 'Publish',
                    },
                    {
                        role: 'Author',
                        source: 'Draft',
                        target: 'Under Review',
                        label: 'Submit for Review',
                    },
                ],
            }

            const edge = getWorkflowEdgeMatchingSourceAndTarget(
                workflow as any,
                'Draft',
                'Published'
            )

            expect(edge).toMatchInlineSnapshot(`
                Object {
                  "label": "Publish",
                  "role": "Author",
                  "source": "Draft",
                  "target": "Published",
                }
            `)
        })

        it('should return undefined if the requested edge does not exist', () => {
            const workflow = {
                name: 'Bacon Workflow',
                edges: [
                    {
                        role: 'Author',
                        source: 'Draft',
                        target: 'Published',
                        label: 'Publish',
                    },
                    {
                        role: 'Author',
                        source: 'Draft',
                        target: 'Under Review',
                        label: 'Submit for Review',
                    },
                ],
            }

            const edge = getWorkflowEdgeMatchingSourceAndTarget(
                workflow as any,
                'Draft',
                'Foo'
            )

            expect(edge).toBeUndefined()
        })
    })

    describe('getWorkflowNodeAndEdgesForState', () => {
        interface StateToResults {
            workflowName: string
            state: string
            nodeId: string
            edgeLabels: string[]
        }

        test.each`
            workflowName                     | state             | nodeId            | edgeLabels
            ${'editPublishCmrWorkflow'}      | ${undefined}      | ${'Init'}         | ${['Add New']}
            ${'editPublishCmrWorkflow'}      | ${'Init'}         | ${'Init'}         | ${['Add New']}
            ${'editPublishCmrWorkflow'}      | ${'Draft'}        | ${'Draft'}        | ${['Publish', 'Delete Permanently']}
            ${'editPublishCmrWorkflow'}      | ${'Published'}    | ${'Published'}    | ${['Delete Permanently']}
            ${'editPublishCmrWorkflow'}      | ${'Hidden'}       | ${'Hidden'}       | ${['Delete Permanently']}
            ${'editPublishCmrWorkflow'}      | ${'Deleted'}      | ${'Deleted'}      | ${[]}
            ${'modifyReviewPublishWorkflow'} | ${undefined}      | ${'Init'}         | ${['Create']}
            ${'modifyReviewPublishWorkflow'} | ${'Init'}         | ${'Init'}         | ${['Create']}
            ${'modifyReviewPublishWorkflow'} | ${'Draft'}        | ${'Draft'}        | ${['Submit for review', 'Delete Permanently']}
            ${'modifyReviewPublishWorkflow'} | ${'Under Review'} | ${'Under Review'} | ${['Needs more work', 'Approve publication']}
            ${'modifyReviewPublishWorkflow'} | ${'Approved'}     | ${'Approved'}     | ${['Publish', `I don't like it!`]}
            ${'modifyReviewPublishWorkflow'} | ${'Published'}    | ${'Published'}    | ${['Un-publish', 'Delete Permanently']}
            ${'modifyReviewPublishWorkflow'} | ${'Hidden'}       | ${'Hidden'}       | ${['Publish', 'Delete Permanently', 'Delete Permanently']}
            ${'modifyReviewPublishWorkflow'} | ${'Deleted'}      | ${'Deleted'}      | ${[]}
        `(
            'should return a node with id of `$nodeId` and edges `$edgeLabels` for a state of `$state` state of the workflow `$workflowName`',
            ({ workflowName, state, nodeId, edgeLabels }: StateToResults) => {
                const workflows = {
                    editPublishCmrWorkflow,
                    modifyReviewPublishWorkflow,
                }
                const results = getWorkflowNodeAndEdgesForState(
                    workflows[workflowName],
                    state
                )

                expect(results.node.id).toEqual(nodeId)
                expect(results.edges.map(edge => edge.label)).toEqual(edgeLabels)
            }
        )
    })
})
