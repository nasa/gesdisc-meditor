import { z } from 'zod'

export const baseModelSchema = z.object({
    model: z.string().min(1).transform(encodeURIComponent),
})

export const modelSchema = baseModelSchema
    // rename old names to their new, more readable counterparts
    .transform(({ model }) => ({
        modelName: model,
    }))

export const baseDocumentSchema = baseModelSchema.extend({
    title: z.string().min(1).transform(encodeURIComponent),
    version: z
        .string()
        .optional()
        // must be a valid date if provided
        .refine(value => !value || !isNaN(Date.parse(value)), {
            message: 'Version must be a valid date string',
        })
        .transform(value => (value ? encodeURIComponent(value) : value)),
})

export const documentSchema = baseDocumentSchema
    // rename old names to their new, more readable counterparts
    .transform(({ model, title, version }) => ({
        modelName: model,
        documentTitle: title,
        documentVersion: version,
    }))
