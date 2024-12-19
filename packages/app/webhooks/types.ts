import type { Document } from 'documents/types'
import type { ModelWithWorkflow } from 'models/types'
import type { z } from 'zod'

import type { WebhookConfigSchema } from './schema'

export type WebhookConfig = z.infer<typeof WebhookConfigSchema>

export type WebhookPayload = {
    model: ModelWithWorkflow
    document: Document
    state: string
}
