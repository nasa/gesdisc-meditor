import type { Db } from 'mongodb'
import getDb from '../../lib/mongodb'
import {
    getTargetStatesFromWorkflow,
    getWorkflowEdgeMatchingSourceAndTarget,
} from '../service'
import editPublishCmrWorkflow from './__fixtures__/edit-publish-cmr.json'
import editPublishWorkflow from './__fixtures__/edit-publish.json'
import modifyReviewPublishWorkflow from './__fixtures__/modify-review-publish.json'

describe('Workflows', () => {
    let db: Db

    beforeAll(async () => {
        db = await getDb()

        await db.collection('Workflows').insertOne(editPublishCmrWorkflow)
        await db.collection('Workflows').insertOne(editPublishWorkflow)
        await db.collection('Workflows').insertOne(modifyReviewPublishWorkflow)
    })

    afterAll(async () => {
        await db.collection('Workflows').deleteMany({})
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
})
