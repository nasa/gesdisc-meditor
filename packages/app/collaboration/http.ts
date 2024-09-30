import type { APIError, ErrorData } from '../declarations'
import { ErrorCode, HttpException } from '../utils/errors'
import type { Collaborator } from './types'

export async function updateCollaborators(
    collaborator: Collaborator,
    documentTitle: string,
    modelName: string
): Promise<ErrorData<Collaborator[]>> {
    try {
        const response = await fetch(
            `/meditor/api/collaboration/models/${encodeURIComponent(
                modelName
            )}/documents/${encodeURIComponent(documentTitle)}`,
            { body: JSON.stringify(collaborator), method: 'POST' }
        )

        if (!response.ok) {
            const { error }: APIError = await response.json()

            throw new HttpException(ErrorCode.InternalServerError, error)
        }

        const collaborators = await response.json()

        return [null, collaborators]
    } catch (error) {
        return [error, null]
    }
}

export async function getCollaborators(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<Collaborator[]>> {
    try {
        const response = await fetch(
            `/meditor/api/collaboration/models/${encodeURIComponent(
                modelName
            )}/documents/${encodeURIComponent(documentTitle)}`,
            { method: 'GET' }
        )

        if (!response.ok) {
            const { error }: APIError = await response.json()

            throw new HttpException(ErrorCode.InternalServerError, error)
        }

        const collaborators = await response.json()

        return [null, collaborators]
    } catch (error) {
        return [error, null]
    }
}
