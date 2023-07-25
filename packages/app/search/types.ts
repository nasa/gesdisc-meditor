import type { DocumentMetadata } from '../documents/types'

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
    titleProperty: string
    schema: string
    layout: string
    'x-meditor'?: ModelMetadata
    category?: string
    workflow?: string
    notificationTemplate?: string
    templates?: Template[]
}

export interface ModelMetadata extends DocumentMetadata {
    count?: number
    countAll?: number
}

export type Template = {
    jsonpath: string
    macro: string
}
