import type { DocumentMetadata } from '../documents/types'
import type { Workflow } from '../workflows/types'

export interface DocumentsSearchOptions {
    searchTerm?: string
    filter?: string // ex. state:Draft
    sort?: string // ex. modifiedOn | -modifiedOn
    includeFields?: string[] // ex. ["Property", "Property.ChildItem"]
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
    notificationTemplate?: string
    templates?: Template[]
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

export type Template = {
    jsonpath: string
    macro: string
}

export type PopulatedTemplate = Template & {
    result: any
}
