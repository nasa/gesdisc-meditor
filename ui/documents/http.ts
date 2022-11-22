import type { APIError, ErrorData } from '../declarations'
import { ErrorCode, HttpException } from '../utils/errors'
import type { DocumentPublications, Document } from './types'

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

export { fetchDocument, fetchDocumentPublications }
