import { Db, ObjectID } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import { DocumentComment, NewDocumentComment } from './types'

class CommentsDb {
    #COMMENTS_COLLECTION = 'Comments'
    #db: Db

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getCommentForDocument(
        commentId: string,
        //? this method is called from a REST url, /models/{modelName}/documents/{documentTitle}/comments/{commentId}
        //? Even though we have a commentId, we need to also verify that this comment belongs to the right document in a particular model
        // TODO: introduce a base level /api/comments/{ID?} API which could simplify this entire class and allow us to have generic "findById"/"find"/"insert"/etc. methods
        documentTitle: string,
        modelName: string
    ) {
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

        const [comment = {}] = await this.#db
            .collection<DocumentComment>('Comments')
            .aggregate(query, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(comment)
    }

    async getCommentsForDocument(documentTitle: string, modelName: string) {
        const query: any[] = [
            { $match: { $and: [{ documentId: documentTitle, model: modelName }] } },
        ]

        const comments = await this.#db
            .collection<DocumentComment>('Comments')
            .aggregate(query, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(comments)
    }

    async insertOne(comment: NewDocumentComment): Promise<DocumentComment> {
        const { insertedId } = await this.#db
            .collection<NewDocumentComment>(this.#COMMENTS_COLLECTION)
            .insertOne(comment)

        return this.getCommentById(insertedId.toString())
    }

    async updateCommentText(
        commentId: string,
        newText: string
    ): Promise<DocumentComment> {
        await this.#db.collection(this.#COMMENTS_COLLECTION).updateOne(
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
        await this.#db.collection(this.#COMMENTS_COLLECTION).updateMany(
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
        const comment = await this.#db.collection(this.#COMMENTS_COLLECTION).findOne({
            _id: new ObjectID(commentId),
        })

        return makeSafeObjectIDs(comment)
    }
}

const db = new CommentsDb()

async function getCommentsDb() {
    await db.connect(getDb)

    return db
}

export { getCommentsDb }
