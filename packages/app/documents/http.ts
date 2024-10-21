import type { APIError, ErrorData } from '../declarations'
import { ErrorCode, HttpException } from '../utils/errors'
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

            //? This would be a bit harder to do with positional arguments, but perhaps we can accept either an error code OR a status code, where the class has a `mapStatusToErrorCode` method or something.
            throw new HttpException(ErrorCode.BadRequest, error) // TODO: figure out proper error code using the status
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

            throw new HttpException(ErrorCode.BadRequest, error) // TODO: figure out proper error code using the status
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

            throw new HttpException(ErrorCode.BadRequest, error) // TODO: figure out proper error code using the status
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
            const { error }: APIError = await response.json()

            throw new HttpException(ErrorCode.BadRequest, error) // TODO: figure out proper error code using the status
        }

        const newDocument = await response.json()

        return [null, newDocument]
    } catch (error) {
        return [error, null]
    }
}

async function bulkUpdateDocument(
    modelName: string,
    selectedDocuments: string[],
    operations: any
) {
    try {
        const documentTitles = `"${selectedDocuments.join('", "')}"`

        console.log(documentTitles)

        const formattedOperations = operations.map(operation => ({
            ...operation,
            path: '/' + operation.path.replace('.', '/'),
        }))

        console.log(formattedOperations)
        console.log(formattedOperations)

        const response = await fetch(
            `/meditor/api/models/${encodeURIComponent(modelName)}/documents/bulk`,
            {
                method: 'PATCH',
                headers: {
                    'If-Match': documentTitles,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedOperations),
            }
        )

        if (!response.ok) {
            const { error }: APIError = await response.json()

            throw new HttpException(ErrorCode.BadRequest, error)
        }

        const bulkUpdateResponse = await response.json()

        return [null, bulkUpdateResponse]
    } catch (error) {
        return [error, null]
    }
}

export {
    bulkUpdateDocument,
    cloneDocument,
    createDocument,
    fetchDocument,
    fetchDocumentPublications,
}
