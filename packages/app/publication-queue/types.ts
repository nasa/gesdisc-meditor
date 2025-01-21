import { publicationAcknowledgementSchema } from './schema'
import { z } from 'zod'
import type { DocumentMessage } from '../documents/types'
import type { EmailMessage } from '../email-notifications/types'

export type QueueMessage = EmailMessage | DocumentMessage

export type PublicationAcknowledgement = z.infer<
    typeof publicationAcknowledgementSchema
>
