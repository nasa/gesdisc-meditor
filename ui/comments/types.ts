export type DocumentComment = {
    /** MongoDB Id */
    _id: string
    createdBy: string
    /** date as ISO string */
    createdOn: string
    /** document's title */
    documentId: string
    /** date as ISO string */
    lastEdited?: string
    model: string
    /** MongoDB Id */
    parentId: string
    resolved: boolean
    resolvedBy?: string
    text: string
    userUid: string
    /** date as ISO string */
    version?: string
}

export type NewDocumentComment = Omit<DocumentComment, '_id'>

export type CreateCommentUserInput = Pick<
    DocumentComment,
    'documentId' | 'model' | 'text'
> & {
    parentId?: string // optional parentId on input
}

export type UpdateCommentUserInput = {
    _id: string
    resolved?: boolean
    text?: string
}
