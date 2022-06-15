import getDb from '../lib/mongodb'
import { NotFoundException } from '../utils/errors'
import { getModel } from './model'
import { Workflow } from './types'

export const WORKFLOWS_COLLECTION = 'Workflows'
export const WORKFLOWS_TITLE_PROPERTY = 'name'

export async function getWorkflowForModel(modelName: string): Promise<Workflow> {
    const db = await getDb()
    const model = await getModel(modelName)

    return getWorkflow(model.workflow)
}

export async function getWorkflow(workflowName: string): Promise<Workflow> {
    const db = await getDb()

    const workflow = await db
        .collection(WORKFLOWS_COLLECTION)
        .find({ [WORKFLOWS_TITLE_PROPERTY]: workflowName })
        .sort({ 'x-meditor.modifiedOn': -1 }) // get latest version of workflow
        .limit(1)
        .toArray()

    if (!workflow.length) {
        throw new NotFoundException('Workflow not found: ' + workflowName)
    }

    return workflow[0] as Workflow
}
