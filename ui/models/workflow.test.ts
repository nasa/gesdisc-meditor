import getDb from '../lib/mongodb'
import { getWorkflow, getWorkflowForModel } from './workflow'
import collectionMetadataModel from './__test__/fixtures/models/collection-metadata.json'
import editPublishCmrWorkflow from '../workflows/__tests__/__fixtures__/edit-publish-cmr.json'

describe('Workflow', () => {
    let db

    beforeAll(async () => {
        db = await getDb()

        await db.collection('Models').insertOne(collectionMetadataModel)
        await db.collection('Workflows').insertOne(editPublishCmrWorkflow)
    })

    afterAll(async () => {
        // cleanup
        await db.collection('Models').deleteMany({})
        await db.collection('Workflows').deleteMany({})
    })

    describe('getWorkflowForModel', () => {
        it('should get for the requested model', async () => {
            // TODO: couldn't get spyOn working but that would be ideal here
            const workflow = await getWorkflowForModel('Collection Metadata')

            expect(workflow.name).toEqual(editPublishCmrWorkflow.name)
        })
    })

    describe('getWorkflow', () => {
        it('returns the requested workflow', async () => {
            const workflow = await getWorkflow('Edit-Publish-CMR')

            expect(workflow.name).toEqual(editPublishCmrWorkflow.name)
        })

        it('should throw for a workflow that does not exist', async () => {
            await expect(async () =>
                getWorkflow('Foo')
            ).rejects.toThrowErrorMatchingInlineSnapshot(`"Workflow not found: Foo"`)
        })
    })
})
