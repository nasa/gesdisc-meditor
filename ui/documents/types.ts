export interface DocumentMetadata {
    model: string
    modifiedBy: string
    modifiedOn: string
    publishedTo?: DocumentPublications[]
    state: string
    states: DocumentState[]
    targetStates: string[]
    titleProperty: string
}

export interface Document {
    _id?: string
    'x-meditor'?: DocumentMetadata

    // a document is dynamically built up from a model, so it doesn't have compile-time properties
    // so instead we'll allow any additional properties
    [key: string]: any
}

export type LegacyDocumentWithMetadata = {
    doc: Omit<Document, 'x-meditor'>
    modifiedBy: string
    modifiedOn: string
    state: string
    targetStates: string[]
    title: string
    version: string
}

export type DocumentHistory = {
    modifiedOn: string
    modifiedBy: string
    state: DocumentState['target']
    states: DocumentState[]
}

export type DocumentPublications = {
    /** epoch time in milliseconds */
    failedOn?: number
    redirectToUrl?: string
    message: string
    /** epoch time in milliseconds */
    publishedOn: number
    statusCode: number
    target: string
    url?: string
}

type DocumentState = {
    source: string
    target: string
    modifiedOn: string | null
    modifiedBy?: string
}
