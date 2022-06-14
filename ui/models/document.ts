import { getDb } from '../lib/mongodb'
import { getModel } from './model'
import type { Document, DocumentsSearchOptions, Workflow } from './types'
import { getWorkflow } from './workflow'
import { getDocumentsForModelQuery } from './document.queries'
import { createIndex } from './shared.queries'

// TODO: add OPTIONAL pagination (don't break existing scripts, perhaps the existence of pagination query params changes the output?)
export async function getDocumentsForModel(
    modelName: string,
    searchOptions?: DocumentsSearchOptions
): Promise<Document[]> {
    const db = await getDb()
    const model = await getModel(modelName) // need the model to get the related workflow and title property
    const workflow = await getWorkflow(model.workflow)
    const query = getDocumentsForModelQuery(model.titleProperty, searchOptions) // fetch a document search query

    if (searchOptions?.searchTerm) {
        // ensure we have a searchable index before proceeding
        await createIndex(modelName, model.titleProperty)
    }

    // retrieve the documents
    const documents = (await db
        .collection(modelName)
        .aggregate(query, { allowDiskUse: true })
        .toArray()) as Document[]

    // return documents with target states added
    return documents.map(document => ({
        ...document,
        'x-meditor': {
            ...document['x-meditor'],
            targetStates: getTargetStatesFromWorkflow(document, workflow), // populate document with states it can transition into
        },
    }))
}

/**
 * the workflow contains a list of nodes the document can be in
 * given a document's current state (or the current node they are on) the document can transition to a subset of those workflow nodes
 *
 * example:
 * given a simple workflow: Draft -> Under Review -> Approved -> Published
 * if a document is in state "Under Review", targetStates would be ["Approved"]
 */
export function getTargetStatesFromWorkflow(document: Document, workflow: Workflow) {
    return workflow.edges
        .filter(edge => edge.source == document['x-meditor'].state)
        .map(edge => edge.target)
}
