export type ModelCategory = {
    name: string
    models: Model[]
}

export type Model = {
    _id: string
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

export type ModelIcon = {
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

export type WorkflowState = {
    source: string
    target: string
    modifiedOn: string | null
}

export type PublishedTo = {
    message: string
    statusCode: number
    publishedOn?: number
    failedOn?: number
    url?: string
    target?: string
}
