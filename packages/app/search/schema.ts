import { z } from 'zod'

const searchInputApiSchema = z.object({
    format: z
        .union([
            z.literal('CSV'),
            z.literal('csv'),
            z.literal('JSON'),
            z.literal('json'),
        ])
        .optional(),
    modelName: z.string().min(1),
    pageNumber: z.coerce.number().min(1).default(1),
    query: z.string().min(1),
    resultsPerPage: z.coerce.number().min(1).default(10),
})

const searchInputServiceSchema = z.object({
    modelName: z.string().min(1),
    pageNumber: z.number().min(1).default(1),
    query: z.string().min(1),
    resultsPerPage: z.number().min(1).default(10),
})

export { searchInputApiSchema, searchInputServiceSchema }
