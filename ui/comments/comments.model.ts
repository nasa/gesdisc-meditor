import { z } from 'zod'

export const NewComment = z.object({
    documentId: z.string(),
    model: z.string(),
    text: z.string(),ß
    parentId: z.string().optional(),
    resolved: z.boolean().optional().default(false),
})

export const Comment = NewComment.merge(z.object({
    userUid: z.string(),
    createdOn: z.string(),
    createdBy: z.string(),
}))
