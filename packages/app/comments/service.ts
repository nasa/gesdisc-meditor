import assert from 'assert'
import createError from 'http-errors'
import log from '../lib/log'
import { CommentRepository } from './repository'
import { validate } from 'jsonschema'
import type { ErrorData, User } from '../declarations'
import type {
    CreateCommentUserInput,
    DocumentComment,
    UpdateCommentUserInput,
} from './types'
import {
    NewDocumentCommentUserInputSchema,
    UpdateDocumentCommentUserInputSchema,
} from './validation.schemas'

export async function createCommentAsUser(
    newComment: CreateCommentUserInput,
    user: User
): Promise<ErrorData<DocumentComment>> {
    try {
        assert(user?.uid, new createError.Unauthorized())

        // TODO: use Zod here instead of JSONSchema validation
        const validationResult = validate(
            newComment,
            NewDocumentCommentUserInputSchema
        )

        assert(
            validationResult.valid,
            new createError.BadRequest(validationResult.toString())
        )

        const commentRepository = new CommentRepository()
        const comment = await commentRepository.insertOne({
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
        assert(user?.uid, new createError.Unauthorized())

        const validationResult = validate(
            commentChanges,
            UpdateDocumentCommentUserInputSchema
        )

        assert(
            validationResult.valid,
            new createError.BadRequest(validationResult.toString())
        )

        const commentRepository = new CommentRepository()

        if (commentChanges.resolved) {
            // Resolving a comment is a special case since we need to resolve all the child comments as well.
            // Can safely return early after resolving as the validation rules ensure we aren't calling update to resolve while also updating other properties.
            const resolvedComment = await commentRepository.resolve(
                commentChanges._id,
                user.uid
            )

            return [null, resolvedComment]
        }

        const updatedComment = await commentRepository.updateText(
            commentChanges._id,
            commentChanges.text ?? ''
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
        const commentRepository = new CommentRepository()

        const comment = await commentRepository.findOneForDocumentById(
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
        const commentRepository = new CommentRepository()

        const comments = await commentRepository.findForDocument(
            documentTitle,
            modelName
        )

        return [null, comments]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}
