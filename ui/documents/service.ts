import Fuse from 'fuse.js'
import { ErrorData } from '../declarations'
import getDb from '../lib/mongodb'
import { getModel } from '../models/model'
import type { Document, DocumentsSearchOptions, Workflow } from '../models/types'
import { getWorkflow } from '../models/workflow'
import { getDocumentsDb } from './db'
import { getDocumentsForModelQuery } from './document.queries'
import { DocumentHistory } from './types'

// TODO: add OPTIONAL pagination (don't break existing scripts, perhaps the existence of pagination query params changes the output?)
export async function getDocumentsForModel(
    modelName: string,
    searchOptions?: DocumentsSearchOptions
): Promise<Document[]> {
    const db = await getDb()
    const model = await getModel(modelName) // need the model to get the related workflow and title property
    const workflow = await getWorkflow(model.workflow)
    const query = getDocumentsForModelQuery(model.titleProperty, searchOptions) // fetch a document search query

    // retrieve the documents
    let documents = (await db
        .collection(modelName)
        .aggregate(query, { allowDiskUse: true })
        .toArray()) as Document[]

    if (searchOptions?.searchTerm) {
        // user is attempting a search. Mongo text search is VERY basic, so we'll utiilize fuse.js to do the search
        const fuse = new Fuse(documents, {
            keys: [model.titleProperty], // TODO: investigate searching more than just the title property
        })

        // fuse.js returns search results with extra information, we just need the matching document
        documents = fuse
            .search(searchOptions.searchTerm)
            .map(searchResult => searchResult.item)
    }

    // return documents with target states added
    return documents.map(document => ({
        ...document,
        'x-meditor': {
            ...document['x-meditor'],
            targetStates: getTargetStatesFromWorkflow(document, workflow), // populate document with states it can transition into
        },
    }))
}

export async function getDocumentHistory(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentHistory[]>> {
    try {
        const documentsDb = await getDocumentsDb()
        // todo: refactor once getModel is a class instance of modelsDb
        const { titleProperty = '' } = await getModel(modelName)

        const historyItems = await documentsDb.getDocumentHistory(
            documentTitle,
            modelName,
            titleProperty
        )

        return [null, historyItems]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export async function getDocumentHistoryByVersion(
    versionId: string,
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentHistory>> {
    try {
        const documentsDb = await getDocumentsDb()
        // todo: refactor once getModel is a class instance of modelsDb
        const { titleProperty = '' } = await getModel(modelName)

        const historyItem = await documentsDb.getDocumentHistoryByVersion(
            documentTitle,
            modelName,
            titleProperty,
            versionId
        )

        return [null, historyItem]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
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
