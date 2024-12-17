import createError from 'http-errors'
import type { APIError, ErrorData } from '../declarations'
import type { Document, DocumentPublications } from './types'

async function getApiError(response: Response) {
    try {
        // see if we can parse the error as JSON
        const { status, error }: APIError = await response.json()

        return createError(status, error)
    } catch (err) {
        return createError(500, 'An unknown error occurred, please notify mEditor')
    }
}

async function createDocument(
    document: any,
    modelName: string
): Promise<ErrorData<Document>> {
    try {
        const response = await fetch(
            `/meditor/api/models/${encodeURIComponent(modelName)}/documents`,
            { body: JSON.stringify(document), method: 'POST' }
        )

        if (!response.ok) {
            throw await getApiError(response)
        }

        const createdDocument = await response.json()

        return [null, createdDocument]
    } catch (error) {
        return [error, null]
    }
}

async function fetchDocument(
    documentTitle: string,
    modelName: string,
    documentVersion?: string
): Promise<ErrorData<Document>> {
    try {
        const response = await fetch(
            `/meditor/api/models/${encodeURIComponent(
                modelName
            )}/documents/${encodeURIComponent(documentTitle)}${
                documentVersion ? `/${documentVersion}` : ''
            }`
        )

        if (!response.ok) {
            throw await getApiError(response)
        }

        const document = await response.json()

        return [null, document]
    } catch (error) {
        return [error, null]
    }
}

async function fetchDocumentPublications(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentPublications[]>> {
    try {
        const response = await fetch(
            `/meditor/api/models/${encodeURIComponent(
                modelName
            )}/documents/${encodeURIComponent(documentTitle)}/publications`
        )

        if (!response.ok) {
            throw await getApiError(response)
        }

        const publications = await response.json()

        return [null, publications]
    } catch (error) {
        return [error, null]
    }
}

async function cloneDocument(
    modelName: string,
    documentTitle: string,
    newTitle: string
): Promise<ErrorData<Document>> {
    try {
        const response = await fetch(
            `/meditor/api/models/${encodeURIComponent(
                modelName
            )}/documents/${encodeURIComponent(
                documentTitle
            )}/clone-document?newTitle=${newTitle}`,
            { method: 'POST' }
        )

        if (!response.ok) {
            throw await getApiError(response)
        }

        const newDocument = await response.json()

        return [null, newDocument]
    } catch (error) {
        return [error, null]
    }
}

export { createDocument, fetchDocument, fetchDocumentPublications, cloneDocument }
