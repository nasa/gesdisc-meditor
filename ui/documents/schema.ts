import { z } from 'zod'

const getDocumentInputSchema = z.object({
    documentTitle: z.string().min(1),
    documentVersion: z.string().endsWith('Z').optional(),
    modelName: z.string().min(1),
    sourceToTargetStateMap: z.any(),
    titleProperty: z.string().min(1),
    uid: z.string().min(1),
})

export { getDocumentInputSchema }
