import type { ErrorData } from '../declarations'
import { getModel } from '../models/service'
import type { Workflow, WorkflowEdge } from './types'
import { getWorkflowsDb } from './db'
import { ErrorCode, HttpException } from '../utils/errors'

export async function getWorkflowForModel(
    modelName: string
): Promise<ErrorData<Workflow>> {
    try {
        const [modelError, model] = await getModel(modelName)

        if (modelError) {
            return [modelError, null]
        }

        return getWorkflow(model.workflow)
    } catch (error) {
        return [error, null]
    }
}

export async function getWorkflow(
    workflowName: string
): Promise<ErrorData<Workflow>> {
    try {
        const workflowsDb = await getWorkflowsDb()
        const workflow = await workflowsDb.getWorkflow(workflowName)

        if (!workflow) {
            throw new HttpException(
                ErrorCode.NotFound,
                `The requested workflow, ${workflowName}, was not found.`
            )
        }

        return [null, workflow]
    } catch (error) {
        return [error, null]
    }
}

/**
 * adds the currentNode and currentEdges to the workflow for the given document state
 *
 * This is mainly here to avoid a major UI refactor as `model.workflow.currentNode and model.workflow.currentEdges` is used throughout
 */
export async function getWorkflowByDocumentState(
    workflowName: string,
    documentState?: string
): Promise<ErrorData<Workflow>> {
    try {
        const [workflowError, workflow] = await getWorkflow(workflowName)

        if (workflowError) {
            throw workflowError
        }

        const { node: currentNode, edges: currentEdges } =
            getWorkflowNodeAndEdgesForState(workflow, documentState)

        return [
            null,
            {
                ...workflow,
                currentNode,
                currentEdges,
            },
        ]
    } catch (error) {
        return [error, null]
    }
}

/**
 * the workflow contains a list of edges between states.
 *
 * For states of "Draft", "Under Review", and "Published", the edges could be:
 *  - "Submit for Review"
 *  - "Publish to PROD"
 *
 * Given the above example, calling `getWorkflowEdgeMatchingSourceAndTarget(workflow, "Draft", "Under Review") would return the "Submit For Review" edge
 */
export function getWorkflowEdgeMatchingSourceAndTarget(
    workflow: Workflow,
    source: string,
    target: string
): WorkflowEdge | undefined {
    // find any matching edges
    const matchingEdges = workflow.edges.filter(
        edge => edge.source === source && edge.target === target
    )

    //! if we find more than one edge, the workflow is misconfigured, this is a FATAL error and we should immediately throw
    if (matchingEdges.length > 1) {
        throw new HttpException(
            ErrorCode.InternalServerError,
            `The workflow, ${workflow.name}, is misconfigured due to having duplicate edges for [source=${source}, target=${target}].`
        )
    }

    return matchingEdges[0]
}

/**
 * the workflow contains a list of nodes the document can be in
 * given a document's current state (or the current node they are on) the document can transition to a subset of those workflow nodes
 *
 * example:
 * given a simple workflow: Draft -> Under Review -> Approved -> Published
 * if a document is in state "Under Review", targetStates would be ["Approved"]
 */
export function getTargetStatesFromWorkflow(
    documentState: string,
    workflow: Workflow
) {
    return workflow.edges
        .filter(edge => edge.source == documentState)
        .map(edge => edge.target)
}

/**
 * For a given workflow `state` (ex. "Draft"), this function returns the full workflow node and any edges
 * branching from that node
 */
export function getWorkflowNodeAndEdgesForState(workflow: Workflow, state?: string) {
    const node = state
        ? workflow.nodes.find(node => node.id === state)
        : workflow.nodes[0]

    return {
        node,
        edges: workflow.edges.filter(edge => edge.source === node.id),
    }
}
