import createError from 'http-errors'
import type { APIError, ErrorData } from '../declarations'
import type { Document, DocumentPublications } from './types'

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
            const { status, error }: APIError = await response.json()

            throw createError(status, error)
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
            const { status, error }: APIError = await response.json()

            throw createError(status, error)
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
            const { status, error }: APIError = await response.json()

            throw createError(status, error)
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
            const { status, error }: APIError = await response.json()

            throw createError(status, error)
        }

        const newDocument = await response.json()

        return [null, newDocument]
    } catch (error) {
        return [error, null]
    }
}

export { createDocument, fetchDocument, fetchDocumentPublications, cloneDocument }
