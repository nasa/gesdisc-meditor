import { BadRequestException, UnauthorizedException } from '../utils/errors'
import type { User } from '../auth/types'
import { CreateCommentUserInput, UpdateCommentUserInput } from './types'
import { validate } from 'jsonschema'
import {
    NewDocumentCommentUserInputSchema,
    UpdateDocumentCommentUserInputSchema,
} from './validation.schemas'
import CommentsDb from './db'
import { ErrorData } from '../declarations'
import { DocumentComment } from './types'

export async function createCommentAsUser(
    newComment: CreateCommentUserInput,
    user: User
): Promise<ErrorData<DocumentComment>> {
    try {
        if (!user?.uid) {
            throw new UnauthorizedException()
        }

        const validationResult = validate(
            newComment,
            NewDocumentCommentUserInputSchema
        )

        if (!validationResult.valid) {
            throw new BadRequestException(validationResult.toString())
        }

        const comment = await CommentsDb.insertOne({
            ...newComment, // validated user input
            parentId: newComment.parentId || 'root', // TODO: Why not use undefined rather than 'root'? (refactor opportunity)
            userUid: user.uid,
            createdOn: new Date().toISOString(),
            createdBy: user.name,
            resolved: false, // can't create a resolved comment
        })

        return [null, comment]
    } catch (err: any) {
        console.error(err)

        return [err, null]
    }
}

export async function updateCommentAsUser(
    commentChanges: UpdateCommentUserInput,
    user: User
): Promise<ErrorData<DocumentComment>> {
    try {
        if (!user?.uid) {
            throw new UnauthorizedException()
        }

        const validationResult = validate(
            commentChanges,
            UpdateDocumentCommentUserInputSchema
        )

        if (!validationResult.valid) {
            throw new BadRequestException(validationResult.toString())
        }

        if (commentChanges.resolved) {
            // Resolving a comment is a special case since we need to resolve all the child comments as well.
            // Can safely return early after resolving as the validation rules ensure we aren't calling update to resolve while also updating other properties.
            const resolvedComment = await CommentsDb.resolveComment(
                commentChanges._id,
                user.uid
            )

            return [null, resolvedComment]
        }

        const updatedComment = await CommentsDb.updateCommentText(
            commentChanges._id,
            commentChanges.text
        )

        return [null, updatedComment]
    } catch (err: any) {
        console.error(err)

        return [err, null]
    }
}

export async function getCommentForDocument(
    commentId: string,
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentComment>> {
    try {
        const comment = await CommentsDb.getCommentForDocument(
            commentId,
            documentTitle,
            modelName
        )

        return [null, comment]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export async function getCommentsForDocument(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentComment[]>> {
    try {
        const comments = await CommentsDb.getCommentsForDocument(
            documentTitle,
            modelName
        )

        return [null, comments]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}
