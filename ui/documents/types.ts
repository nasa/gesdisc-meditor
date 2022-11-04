type DocumentState = {
    source: string
    target: string
    modifiedOn: string | null
    modifiedBy?: string
}

export type DocumentHistory = {
    modifiedOn: string
    modifiedBy: string
    state: DocumentState['target']
    states: DocumentState[]
}
