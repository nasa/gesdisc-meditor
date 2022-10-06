import { BadRequestException, UnauthorizedException } from '../utils/errors'
import getDb from '../lib/mongodb'
import type { User } from '../auth/types'
import { CreateCommentUserInput, NewDocumentComment } from './types'
import { validate } from 'jsonschema'
import { NewDocumentCommentUserInputSchema } from './schemas'

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
            parentId: newComment.parentId || 'root', // TODO: Why not use undefined rather than 'root'?
            userUid: user.uid,
            createdOn: new Date().toISOString(),
            createdBy: user.name,
            resolved: false, // can't create a resolved comment
        })

    return db.collection(COMMENTS_COLLECTION).findOne({ _id: insertedId }) // return the new comment
}
