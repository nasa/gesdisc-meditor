export interface DocumentsSearchOptions {
    searchTerm?: string
    filter?: string // ex. state:Draft
    sort?: string // ex. modifiedOn | -modifiedOn
    includeFields?: string
}

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

export interface Workflow {
    _id?: string
    name: string
    roles: string[]
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
    'x-meditor': DocumentMetadata
}

export interface WorkflowNode {
    id: string
    privileges?: WorkflowPrivilege[]
    readyForUse?: boolean
}

export interface WorkflowPrivilege {
    role: string
    privilege: string[]
}

export interface WorkflowEdge {
    role: string
    source: string
    target: string
    label: string
    notify?: boolean
    notifyRoles?: string
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
