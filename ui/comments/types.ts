import { ObjectId } from 'mongodb'

export type MongoDocumentComment = {
    /** MongoDB Id */
    _id: ObjectId
    createdBy: string
    /** date as ISO string */
    createdOn: string
    /** document's title */
    documentId: string
    /** date as ISO string */
    lastEdited?: string
    model: string
    /** MongoDB Id */
    parentId: ObjectId
    resolved: boolean
    text: string
    userUid: string
    /** date as ISO string */
    version: string
}

export type SafeDocumentComment = Omit<MongoDocumentComment, '_id' | 'parentId'> & {
    _id: string
    parentId: string
}
