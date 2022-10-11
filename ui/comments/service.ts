import { BadRequestException, UnauthorizedException } from '../utils/errors'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import type { User } from '../auth/types'
import { CreateCommentUserInput, NewDocumentComment } from './types'
import { validate } from 'jsonschema'
import { NewDocumentCommentUserInputSchema } from './validation.schemas'
import { ErrorData } from '../declarations'
import { getCommentForDocumentQuery, getCommentsForDocumentQuery } from './queries'
import { DocumentComment } from './types'

export const COMMENTS_COLLECTION = 'Comments'

export async function createCommentAsUser(
    newComment: CreateCommentUserInput,
    user: User
) {
    if (!user?.uid) {
        throw new UnauthorizedException()
    }

    const validationResult = validate(newComment, NewDocumentCommentUserInputSchema)

    if (!validationResult.valid) {
        throw new BadRequestException(validationResult.toString())
    }

    const db = await getDb()

    // insert the new comment
    const { insertedId } = await db
        .collection<NewDocumentComment>(COMMENTS_COLLECTION)
        .insertOne({
            ...newComment, // validated user input
            parentId: newComment.parentId || 'root', // TODO: Why not use undefined rather than 'root'? (refactor opportunity)
            userUid: user.uid,
            createdOn: new Date().toISOString(),
            createdBy: user.name,
            resolved: false, // can't create a resolved comment
        })

    return db.collection(COMMENTS_COLLECTION).findOne({ _id: insertedId }) // return the new comment
}

export async function getCommentForDocument({
    commentId,
    documentTitle,
    modelName,
}: {
    commentId: string
    documentTitle: string
    modelName: string
}): Promise<ErrorData<DocumentComment>> {
    try {
        const db = await getDb()
        const query = getCommentForDocumentQuery({
            commentId,
            documentTitle,
            modelName,
        })

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

export async function getCommentsForDocument({
    documentTitle,
    modelName,
}: {
    documentTitle: string
    modelName: string
}): Promise<ErrorData<DocumentComment[]>> {
    try {
        const db = await getDb()
        const query = getCommentsForDocumentQuery({ documentTitle, modelName })

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
