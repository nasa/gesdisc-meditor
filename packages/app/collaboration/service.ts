import type { ErrorData } from 'declarations'
import { parseZodAsErrorData } from 'utils/errors'
import { getCollaboratorsDb } from './db'
import { collaborationInputSchema } from './schema'
import type { Collaborator } from './types'

export async function getDocumentCollaborators(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<Collaborator[]>> {
    try {
        const collaboratorsDb = await getCollaboratorsDb()

        const results = await collaboratorsDb.getDocumentCollaborators(
            documentTitle,
            modelName
        )

        return [null, results]
    } catch (error) {
        return [error, null]
    }
}

export async function setDocumentCollaborator(
    collaborator: Collaborator,
    documentTitle: string,
    modelName: string
): Promise<ErrorData<Collaborator[]>> {
    try {
        const [parsingError, parsedCollaborator] = parseZodAsErrorData<Collaborator>(
            collaborationInputSchema,
            collaborator
        )

        if (parsingError) {
            throw parsingError
        }

        // This condition is not an error, just business logic: if the user doesn't have edit permissions for the document they are not a collaborator.
        if (!parsedCollaborator.privileges.includes('edit')) {
            return await getDocumentCollaborators(documentTitle, modelName)
        }
        const collaboratorsDb = await getCollaboratorsDb()

        const results = await collaboratorsDb.upsertDocumentCollaborator(
            parsedCollaborator,
            documentTitle,
            modelName
        )

        return [null, results]
    } catch (error) {
        return [error, null]
    }
}
