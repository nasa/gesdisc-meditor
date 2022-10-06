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
    text: string
    userUid: string
    /** date as ISO string */
    version: string
}
