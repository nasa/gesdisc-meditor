import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import { getCommentForDocumentQuery, getCommentsForDocumentQuery } from './queries'
import { DocumentComment } from './types'

async function getCommentForDocument({
    commentId,
    documentTitle,
    modelName,
}: {
    commentId: string
    documentTitle: string
    modelName: string
}): Promise<DocumentComment[]> {
    const db = await getDb()
    const query = getCommentForDocumentQuery({ commentId, documentTitle, modelName })

    const comments = await db
        .collection<DocumentComment>('Comments')
        .aggregate(query, { allowDiskUse: true })
        .toArray()

    return makeSafeObjectIDs(comments)
}

async function getCommentsForDocument({
    documentTitle,
    modelName,
}: {
    documentTitle: string
    modelName: string
}): Promise<DocumentComment[]> {
    const db = await getDb()
    const query = getCommentsForDocumentQuery({ documentTitle, modelName })

    const comments = await db
        .collection<DocumentComment>('Comments')
        .aggregate(query, { allowDiskUse: true })
        .toArray()

    return makeSafeObjectIDs(comments)
}

export { getCommentForDocument, getCommentsForDocument }
