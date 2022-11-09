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
