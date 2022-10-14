import { ObjectID } from 'mongodb'
import { DocumentComment, NewDocumentComment } from './types'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'

const COMMENTS_COLLECTION = 'Comments'

class CommentsDb {
    async getCommentForDocument(
        commentId: string,
        //? this method is called from a REST url, /models/{modelName}/documents/{documentTitle}/comments/{commentId}
        //? Even though we have a commentId, we need to also verify that this comment belongs to the right document in a particular model
        // TODO: introduce a base level /api/comments/{ID?} API which could simplify this entire class and allow us to have generic "findById"/"find"/"insert"/etc. methods
        documentTitle: string,
        modelName: string
    ) {
        const db = await getDb()

        const query: any[] = [
            {
                $match: {
                    $and: [
                        {
                            _id: new ObjectID(commentId),
                            documentId: documentTitle,
                            model: modelName,
                        },
                    ],
                },
            },
        ]

        const [comment = {}] = await db
            .collection<DocumentComment>('Comments')
            .aggregate(query, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(comment)
    }

    async getCommentsForDocument(documentTitle: string, modelName: string) {
        const db = await getDb()

        const query: any[] = [
            { $match: { $and: [{ documentId: documentTitle, model: modelName }] } },
        ]

        const comments = await db
            .collection<DocumentComment>('Comments')
            .aggregate(query, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(comments)
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

                    // also resolve any child comments
                    // TODO: confusingly, parentId is a string, not an ObjectID. This would make more sense as an ObjectID
                    { parentId: commentId },
                ],
            },
            { $set: { resolved: true, resolvedBy: resolvedByUserId } }
        )

        return this.getCommentById(commentId)
    }

    private async getCommentById(commentId: string): Promise<DocumentComment> {
        const db = await getDb()

        const comment = (await db.collection(COMMENTS_COLLECTION).findOne({
            _id: new ObjectID(commentId),
        })) as DocumentComment

        return makeSafeObjectIDs(comment)
    }
}

export default new CommentsDb()
