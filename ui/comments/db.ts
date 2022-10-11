import { ObjectID } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import { DocumentComment, NewDocumentComment } from './types'

const COMMENTS_COLLECTION = 'Comments'

class CommentsDb {
    async getCommentById(commentId: string): Promise<DocumentComment> {
        const db = await getDb()

        const comment = (await db.collection(COMMENTS_COLLECTION).findOne({
            _id: new ObjectID(commentId),
        })) as DocumentComment

        return makeSafeObjectIDs(comment)
    }

    async insertOne(comment: NewDocumentComment): Promise<DocumentComment> {
        const db = await getDb()
        const { insertedId } = await db
            .collection<NewDocumentComment>(COMMENTS_COLLECTION)
            .insertOne(comment)

        return this.getCommentById(insertedId.toString())
    }

    async updateCommentText(
        commentId: string,
        newText: string
    ): Promise<DocumentComment> {
        const db = await getDb()

        await db.collection(COMMENTS_COLLECTION).updateOne(
            { _id: new ObjectID(commentId) },
            {
                $set: {
                    text: newText,
                },
            }
        )

        return this.getCommentById(commentId)
    }

    async resolveComment(
        commentId: string,
        resolvedByUserId: string
    ): Promise<DocumentComment> {
        const db = await getDb()

        await db.collection(COMMENTS_COLLECTION).updateMany(
            {
                $or: [
                    { _id: new ObjectID(commentId) }, // resolve the requested comment
                    { parentId: new ObjectID(commentId) }, // also resolve any child comments
                ],
            },
            { $set: { resolved: true, resolvedBy: resolvedByUserId } }
        )

        return this.getCommentById(commentId)
    }
}

export default new CommentsDb()
