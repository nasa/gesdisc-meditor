import { z } from 'zod'
import { publicationAcknowledgementSchema } from './schema'

export type PublicationAcknowledgement = z.infer<
    typeof publicationAcknowledgementSchema
>
