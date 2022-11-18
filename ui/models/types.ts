import type { DocumentMetadata } from '../documents/types'
import type { Workflow, WorkflowEdge, WorkflowNode } from '../workflows/types'

export interface DocumentsSearchOptions {
    searchTerm?: string
    filter?: string // ex. state:Draft
    sort?: string // ex. modifiedOn | -modifiedOn
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

export interface ModelWithWorkflow extends Omit<Model, 'workflow'> {
    workflow: Workflow
}

export interface ModelIcon {
    name: string
    color: string
}

export interface ModelMetadata extends DocumentMetadata {
    count?: number
    countAll?: number
}
