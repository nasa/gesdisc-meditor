import { z } from 'zod'

//* https://datatracker.ietf.org/doc/html/rfc6750 does not require base64 encoding of Bearer tokens.
export const WebhookConfigSchema = z.object({
    URL: z.string().url(),
    token: z.string().min(1),
})

export const WebhookConfigsSchema = z.array(WebhookConfigSchema)
