import { BaseRepository } from '../lib/database/base-repository'
import type { DocumentComment } from './types'

export class CommentRepository extends BaseRepository<DocumentComment> {
    constructor() {
        super('Comments')
    }

    async resolve(
        commentId: string,
        resolvedByUserId: string
    ): Promise<DocumentComment> {
        const db = await this.connectionPromise

        await this.update(
            {
                $or: [
                    { _id: db.ObjectId(commentId) }, // resolve the requested comment

                    // also resolve any child comments
                    // TODO: confusingly, parentId is a string, not an ObjectID. This would make more sense as an ObjectID
                    { parentId: commentId },
                ],
            },
            { $set: { resolved: true, resolvedBy: resolvedByUserId } }
        )

        return this.findOneById(commentId)
    }

    async updateText(commentId: string, newText: string): Promise<DocumentComment> {
        return this.updateOneById(commentId, {
            $set: {
                text: newText,
            },
        })
    }

    async findForDocument(documentTitle: string, modelName: string) {
        return this.find({
            $match: { $and: [{ documentId: documentTitle, model: modelName }] },
        })
    }

    async findOneForDocumentById(
        commentId: string,
        documentTitle: string,
        modelName: string
    ) {
        const db = await this.connectionPromise
        return this.findOne({
            $match: {
                $and: [
                    {
                        _id: db.ObjectId(commentId),
                        documentId: documentTitle,
                        model: modelName,
                    },
                ],
            },
        })
    }
}
