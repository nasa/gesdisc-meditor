export interface ModelCategory {
    name: string
    models: Model[]
}

export interface Model {
    _id?: string
    name: string
    description: string
    icon: ModelIcon
    titleProperty: string
    schema: string
    layout: string
    'x-meditor'?: ModelMetadata
    category?: string
    workflow?: string
}

export interface ModelIcon {
    name: string
    color: string
}

export interface ModelMetadata extends DocumentMetadata {
    count?: number
    countAll?: number
}

export interface DocumentMetadata {
    model: string
    modifiedOn: string
    modifiedBy: string
    state: string
    targetStates: string[]
    states: WorkflowState[]
    publishedTo?: PublishedTo[]
}

export interface Document {
    _id?: string
    'x-meditor'?: DocumentMetadata

    // a document is dynamically built up from a model, so it doesn't have compile-time properties
    // so instead we'll allow any additional properties
    [key: string]: any
}

export interface WorkflowState {
    source: string
    target: string
    modifiedOn: string | null
}

export interface PublishedTo {
    message: string
    statusCode: number
    publishedOn?: number
    failedOn?: number
    url?: string
    target?: string
}
