import type { ErrorData } from 'declarations'
import type { ZodSchema } from 'zod'

export function parseZodAsErrorData<T>(schema: ZodSchema, input: any): ErrorData<T> {
    try {
        const data = schema.parse(input)

        return [null, data]
    } catch (error) {
        return [error, null]
    }
}
