import { z } from 'zod'

export const getDocumentInputSchema = z.object({
    documentTitle: z.string().min(1),
    documentVersion: z.string().endsWith('Z').optional(),
    modelName: z.string().min(1),
    sourceToTargetStateMap: z.any(),
    titleProperty: z.string().min(1),
    uid: z.string().min(1).optional(),
})

export const bulkDocumentHeadersSchema = z.object({
    'if-match': z
        .string()
        .regex(
            new RegExp(/^"([^"]+)"(,\s*"[^"]+")*$/),
            'must be a comma-separated list of document titles to update (ex. "title1", "title2", ...)'
        ),
})

export const patchDocumentsInputSchema = z.array(
    z.object({
        // must match an operation found in https://jsonpatch.com/
        op: z.enum(['add', 'remove', 'replace', 'move', 'copy', 'test']),
        // path must match the format `/PATH/SUBPATH` (starts with a / follow by one or more characters)
        path: z.string().min(2).regex(new RegExp(/^\/.+/)),
        // value is optional
        value: z.any().optional(),
    })
)
