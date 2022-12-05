import { validate } from 'jsonschema'
import type { User } from '../auth/types'
import type { ErrorData } from '../declarations'
import { ErrorCode, HttpException } from '../utils/errors'
import { getCommentsDb } from './db'
import type {
    CreateCommentUserInput,
    DocumentComment,
    UpdateCommentUserInput,
} from './types'
import {
    NewDocumentCommentUserInputSchema,
    UpdateDocumentCommentUserInputSchema,
} from './validation.schemas'
import log from '../lib/log'

export async function createCommentAsUser(
    newComment: CreateCommentUserInput,
    user: User
): Promise<ErrorData<DocumentComment>> {
    try {
        const commentsDb = await getCommentsDb()

        if (!user?.uid) {
            throw new HttpException(ErrorCode.Unauthorized, 'Unauthorized')
        }

        const validationResult = validate(
            newComment,
            NewDocumentCommentUserInputSchema
        )

        if (!validationResult.valid) {
            throw new HttpException(ErrorCode.BadRequest, validationResult.toString())
        }

        const comment = await commentsDb.insertOne({
            ...newComment, // validated user input
            parentId: newComment.parentId || 'root', // TODO: Why not use undefined rather than 'root'? (refactor opportunity)
            userUid: user.uid,
            createdOn: new Date().toISOString(),
            createdBy: user.name,
            resolved: false, // can't create a resolved comment
        })

        return [null, comment]
    } catch (err: any) {
        log.error(err)

        return [err, null]
    }
}

export async function updateCommentAsUser(
    commentChanges: UpdateCommentUserInput,
    user: User
): Promise<ErrorData<DocumentComment>> {
    try {
        const commentsDb = await getCommentsDb()

        if (!user?.uid) {
            throw new HttpException(ErrorCode.Unauthorized, 'Unauthorized')
        }

        const validationResult = validate(
            commentChanges,
            UpdateDocumentCommentUserInputSchema
        )

        if (!validationResult.valid) {
            throw new HttpException(ErrorCode.BadRequest, validationResult.toString())
        }

        if (commentChanges.resolved) {
            // Resolving a comment is a special case since we need to resolve all the child comments as well.
            // Can safely return early after resolving as the validation rules ensure we aren't calling update to resolve while also updating other properties.
            const resolvedComment = await commentsDb.resolveComment(
                commentChanges._id,
                user.uid
            )

            return [null, resolvedComment]
        }

        const updatedComment = await commentsDb.updateCommentText(
            commentChanges._id,
            commentChanges.text
        )

        return [null, updatedComment]
    } catch (err: any) {
        log.error(err)

        return [err, null]
    }
}

export async function getCommentForDocument(
    commentId: string,
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentComment>> {
    try {
        const commentsDb = await getCommentsDb()

        const comment = await commentsDb.getCommentForDocument(
            commentId,
            documentTitle,
            modelName
        )

        return [null, comment]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

export async function getCommentsForDocument(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentComment[]>> {
    try {
        const commentsDb = await getCommentsDb()

        const comments = await commentsDb.getCommentsForDocument(
            documentTitle,
            modelName
        )

        return [null, comments]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}
