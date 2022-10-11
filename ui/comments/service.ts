import { BadRequestException, UnauthorizedException } from '../utils/errors'
import type { User } from '../auth/types'
import { CreateCommentUserInput } from './types'
import { validate } from 'jsonschema'
import { NewDocumentCommentUserInputSchema } from './validation.schemas'
import { ErrorData } from '../declarations'
import { DocumentComment } from './types'
import CommentsDb from './db'

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
