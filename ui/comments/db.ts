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
}

export default new CommentsDb()
