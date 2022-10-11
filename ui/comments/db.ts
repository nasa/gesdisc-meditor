import getDb from '../lib/mongodb'
import { DocumentComment, NewDocumentComment } from './types'

const COMMENTS_COLLECTION = 'Comments'

class CommentsDb {
    async insertOne(comment: NewDocumentComment): Promise<DocumentComment> {
        const db = await getDb()
        const { insertedId } = await db
            .collection<NewDocumentComment>(COMMENTS_COLLECTION)
            .insertOne(comment)

        return (await db
            .collection(COMMENTS_COLLECTION)
            .findOne({ _id: insertedId })) as DocumentComment
    }
}

export default new CommentsDb()
