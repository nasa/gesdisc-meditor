import { latestVersionOfDocument, UNSPECIFIED_STATE_NAME } from '../lib/aggregations'
import { getDb } from '../lib/mongodb'
import { BadRequestException } from '../utils/errors'
import { getModel } from './model'
import type { Document, Workflow } from './types'
import { convertLuceneQueryToMongo } from '../utils/search'
import { getWorkflow } from './workflow'

// TODO: add OPTIONAL pagination (don't break existing scripts, perhaps the existence of pagination query params changes the output?)
export async function getDocumentsForModel(
    modelName: string,
    luceneQuery?: string
): Promise<Document[]> {
    const db = await getDb()
    const model = await getModel(modelName) // need the model to get the related workflow and title property
    const workflow = await getWorkflow(model.workflow)

    // build the initial query
    let query = [].concat(
        [
            // filter out deleted documents
            {
                $match: {
                    'x-meditor.deletedOn': { $exists: false },
                },
            },
            // since documents can be so large, only include a handful of needed fields
            // TODO: once pagination is added to the API, this shouldn't be needed anymore
            {
                $project: {
                    _id: 0,
                    title: `$${model.titleProperty}`, // add a title field that matches the document[model.titleProperty] field
                    [model.titleProperty]: 1,
                    'x-meditor': 1,
                },
            },
        ],
        latestVersionOfDocument(model.titleProperty),
        [{ $sort: { 'x-meditor.modifiedOn': -1 } }] // sort the result
    )

    // if the user is searching the documents, we'll convert their query to the mongo equivalent
    if (luceneQuery) {
        try {
            const filterMatch = convertLuceneQueryToMongo(luceneQuery)

            // add filter to existing query
            query[0].$match = {
                ...query[0].$match,
                ...filterMatch,
            }
        } catch (err) {
            throw new BadRequestException('Improperly formatted filter')
        }
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

            state: document['x-meditor'].state || UNSPECIFIED_STATE_NAME, // make sure state is populated
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
