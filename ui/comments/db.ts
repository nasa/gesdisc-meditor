import getDb from '../lib/mongodb'
import { DocumentComment, NewDocumentComment, UpdateCommentUserInput } from './types'

const COMMENTS_COLLECTION = 'Comments'

export default class CommentsDb {
    async insertOne(comment: NewDocumentComment): Promise<DocumentComment> {
        const db = await getDb()
        const { insertedId } = await db
            .collection<NewDocumentComment>(COMMENTS_COLLECTION)
            .insertOne(comment)

        return (await db
            .collection(COMMENTS_COLLECTION)
            .findOne({ _id: insertedId })) as DocumentComment
    }

    async updateOne(comment: UpdateCommentUserInput): Promise<DocumentComment> {
        const db = await getDb()

        await db.collection<DocumentComment>(COMMENTS_COLLECTION).updateOne(
            { _id: comment._id },
            {
                $set: {
                    // specifically pull out the fields that can be updated
                    ...(!!comment.resolved && {
                        resolved: comment.resolved,
                    }),
                    ...(!!comment.text && { text: comment.text }),
                },
            }
        )

        return (await db
            .collection(COMMENTS_COLLECTION)
            .findOne({ _id: comment._id })) as DocumentComment
    }
}
