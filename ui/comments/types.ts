import { z } from 'zod'
import { NewComment, Comment } from './comments.model'

export type NewDocumentComment = z.infer<typeof NewComment>
export type DocumentComment = z.infer<typeof Comment>
