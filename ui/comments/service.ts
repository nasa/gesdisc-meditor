import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import { getCommentForDocumentQuery, getCommentsForDocumentQuery } from './queries'
import { MongoDocumentComment, SafeDocumentComment } from './types'

async function getCommentForDocument({
    commentId,
    documentTitle,
    modelName,
}: {
    commentId: string
    documentTitle: string
    modelName: string
}) {
    const db = await getDb()
    const query = getCommentForDocumentQuery({ commentId, documentTitle, modelName })

    const comments: MongoDocumentComment[] = await db
        .collection('Comments')
        .aggregate(query, { allowDiskUse: true })
        .toArray()

    return makeSafeObjectIDs(comments) as SafeDocumentComment
}

async function getCommentsForDocument({
    documentTitle,
    modelName,
}: {
    documentTitle: string
    modelName: string
}) {
    const db = await getDb()
    const query = getCommentsForDocumentQuery({ documentTitle, modelName })

    const comments: MongoDocumentComment[] = await db
        .collection('Comments')
        .aggregate(query, { allowDiskUse: true })
        .toArray()

    return makeSafeObjectIDs(comments) as SafeDocumentComment
}

export { getCommentForDocument, getCommentsForDocument }
