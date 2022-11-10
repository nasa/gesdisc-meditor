import type { Document, LegacyDocumentWithMetadata } from './types'

export function adaptDocumentToLegacyDocument(document: Document) {
    const { modifiedBy, modifiedOn, state, targetStates, titleProperty } =
        document['x-meditor']
    const { ['x-meditor']: metadata, ...documentWithoutMetadata } = document

    const legacyDocumentWithMetadata: LegacyDocumentWithMetadata = {
        doc: documentWithoutMetadata,
        modifiedBy,
        modifiedOn,
        state,
        targetStates,
        title: document[titleProperty],
        version: modifiedOn,
    }

    return legacyDocumentWithMetadata
}
