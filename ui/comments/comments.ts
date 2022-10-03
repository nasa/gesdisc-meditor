import { BadRequestException } from '../utils/errors'
import getDb from '../lib/mongodb'
import type { User } from '../models/types'
import { DocumentComment, NewDocumentComment } from './types'
import { NewComment } from './comments.model'

export const COMMENTS_COLLECTION = 'Comments'

export async function createCommentAsUser(newComment: NewDocumentComment, user: User) {
    const validation = NewComment.safeParse(newComment)

    if (!validation.success) {
        throw new BadRequestException(validation.error)
    }

    const db = await getDb()

    const response = await db.collection<DocumentComment>(COMMENTS_COLLECTION).insertOne({
        documentId: newComment.documentId,
        model: newComment.model,
        text: newComment.text,
        parentId: newComment.parentId || 'root',
        userUid: user.uid,
        createdOn: new Date().toISOString(),
        createdBy: user.name,
    })

    return db.collection(COMMENTS_COLLECTION).findOne({ _id: insertedId })
}

export 
