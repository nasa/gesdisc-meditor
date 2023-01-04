import type { DocumentMessage } from '../documents/types'
import type { EmailMessage } from '../email-notifications/types'

export type QueueMessage = EmailMessage | DocumentMessage
