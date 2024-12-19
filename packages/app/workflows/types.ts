import type { DocumentMetadata } from '../documents/types'

export interface Workflow {
    _id?: string
    name: string
    roles: string[]
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
    'x-meditor': DocumentMetadata
    currentNode?: WorkflowNode
    currentEdges?: WorkflowEdge[]
}

export interface WorkflowNode {
    id: string
    privileges?: WorkflowPrivilege[]
    readyForUse?: boolean
    allowValidationErrors?: boolean
    emailMessage?: string
    publishable?: boolean
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
    webhookURL?: string
}

export interface WorkflowState {
    source: string
    target: string
    modifiedOn: string | null
}
