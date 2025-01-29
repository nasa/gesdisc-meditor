import { z } from 'zod'

export const publicationAcknowledgementSchema = z.object({
    id: z.string().min(10),
    state: z.string(),
    model: z.string(),
    message: z.string().optional(),
    target: z.string().optional(),
    statusCode: z.number().optional(),
    url: z.string().optional(),
    redirectToUrl: z.string().optional(),
})
