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

export type WebhookAcknowledgementPayload = {
    acknowledgementUrl: string
    acknowledgementBearerToken: string
}

export type AcknowledgementsBearerTokenDecryptedParts = {
    _id: string
    modelName: string
}

export type WebhookDbDocument = {
    uid: string
    responseData: any
    statusCode: number
    statusMessage: string
    webhook: WebhookConfig
    payload: WebhookPayload
    isTimeout: boolean
}
