import type { Document, LegacyDocumentWithMetadata } from './types'

export function adaptDocumentToLegacyDocument(document: Document) {
    const { ['x-meditor']: metadata, ...documentWithoutMetadata } = document
    const { modifiedBy, modifiedOn, state, targetStates, titleProperty } = metadata

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
