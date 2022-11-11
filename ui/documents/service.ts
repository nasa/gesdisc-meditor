import Fuse from 'fuse.js'
import type { ErrorData } from '../declarations'
import { getModel } from '../models/model'
import type { Document, DocumentsSearchOptions } from '../models/types'
import { getWorkflow } from '../models/workflow'
import { BadRequestException } from '../utils/errors'
import { getTargetStatesFromWorkflow } from '../workflows/service'
import { getDocumentsDb } from './db'
import type { DocumentHistory, DocumentPublications } from './types'

// TODO: add OPTIONAL pagination (don't break existing scripts, perhaps the existence of pagination query params changes the output?)
export async function getDocumentsForModel(
    modelName: string,
    searchOptions?: DocumentsSearchOptions
): Promise<ErrorData<Document[]>> {
    try {
        const documentsDb = await getDocumentsDb()
        // todo: refactor once getModel is a class instance of modelsDb
        const { titleProperty = '', workflow: workflowName = '' } = await getModel(
            modelName
        ) // need the model to get the related workflow and title property
        // todo: refactor once getWorkflow is a class instance of workflowDb
        const workflow = await getWorkflow(workflowName)

        let documents = await documentsDb.getDocumentsForModel(
            modelName,
            searchOptions,
            titleProperty
        )

        if (searchOptions?.searchTerm) {
            // user is attempting a search. Mongo text search is VERY basic, so we'll utilize fuse.js to do the search
            const fuse = new Fuse(documents, {
                keys: [titleProperty], // TODO: investigate searching more than just the title property
            })

            // fuse.js returns search results with extra information, we just need the matching document
            documents = fuse
                .search(searchOptions.searchTerm)
                .map(searchResult => searchResult.item)
        }

        // add target states to documents
        documents = documents.map(document => ({
            ...document,
            'x-meditor': {
                ...document['x-meditor'],
                targetStates: getTargetStatesFromWorkflow(
                    document['x-meditor'].state,
                    workflow
                ), // populate document with states it can transition into
            },
        }))

        return [null, documents]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
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

export async function getDocumentPublications(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentPublications[]>> {
    try {
        const documentsDb = await getDocumentsDb()
        // todo: refactor once getModel is a class instance of modelsDb
        const { titleProperty = '' } = await getModel(modelName)

        const publications = await documentsDb.getDocumentPublications(
            documentTitle,
            modelName,
            titleProperty
        )

        return [null, publications]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export async function changeDocumentState(
    documentTitle: string,
    modelName: string,
    newState: string // must be a string, not enum, due to states not existing at compile time
): Promise<ErrorData<Document>> {
    try {
        const { titleProperty = '', workflow: workflowName = '' } = await getModel(
            modelName
        ) // todo: refactor once getModel is a class instance of modelsDb
        const workflow = await getWorkflow(workflowName) // todo: refactor once getWorkflow is a class instance of workflowDb

        // fetch the requested document
        const documentsDb = await getDocumentsDb()
        const document = await documentsDb.getDocument(
            documentTitle,
            modelName,
            titleProperty
        )

        if (!newState) {
            throw new BadRequestException('No state provided')
        }

        if (!document) {
            throw new BadRequestException(
                `Document, ${documentTitle}, in model, ${modelName}, does not exist`
            )
        }

        if (newState === document['x-meditor'].state) {
            throw new BadRequestException(
                `Cannot transition to state [${newState}] as the document is in this state already`
            )
        }

        const targetStates = getTargetStatesFromWorkflow(
            document['x-meditor'].state,
            workflow
        )

        if (targetStates.indexOf(newState) < 0) {
            throw new BadRequestException(
                `Cannot transition to state [${newState}] as it is not a valid state in the workflow`
            )
        }

        return [null, document]
    } catch (error) {
        return [error, null]
    }
}
