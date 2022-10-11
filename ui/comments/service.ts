import { ErrorData } from '../declarations'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import { getCommentForDocumentQuery, getCommentsForDocumentQuery } from './queries'
import { DocumentComment } from './types'

async function getCommentForDocument(
    commentId: string,
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentComment>> {
    try {
        const db = await getDb()
        const query = getCommentForDocumentQuery(commentId, documentTitle, modelName)

        const [comment = {}] = await db
            .collection<DocumentComment>('Comments')
            .aggregate(query, { allowDiskUse: true })
            .toArray()

        return [null, makeSafeObjectIDs(comment)]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

async function getCommentsForDocument(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentComment[]>> {
    try {
        const db = await getDb()
        const query = getCommentsForDocumentQuery(documentTitle, modelName)

        const comments = await db
            .collection<DocumentComment>('Comments')
            .aggregate(query, { allowDiskUse: true })
            .toArray()

        return [null, makeSafeObjectIDs(comments)]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export { getCommentForDocument, getCommentsForDocument }
