import { BadRequestException, UnauthorizedException } from '../utils/errors'
import type { User } from '../auth/types'
import { CreateCommentUserInput, UpdateCommentUserInput } from './types'
import { validate } from 'jsonschema'
import {
    NewDocumentCommentUserInputSchema,
    UpdateDocumentCommentUserInputSchema,
} from './validation.schemas'
import CommentsDb from './db'

const commentsDb = new CommentsDb()

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

    return commentsDb.insertOne({
        ...newComment, // validated user input
        parentId: newComment.parentId || 'root', // TODO: Why not use undefined rather than 'root'? (refactor opportunity)
        userUid: user.uid,
        createdOn: new Date().toISOString(),
        createdBy: user.name,
        resolved: false, // can't create a resolved comment
    })
}

export async function updateCommentAsUser(
    commentChanges: UpdateCommentUserInput,
    user: User
) {
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

    return commentsDb.updateOne(commentChanges)
}
