import type { ErrorData } from 'declarations'

/**
 * If passed an object or JSON string, it returns an object. Other parsing errors are returned, not thrown.
 */
function safeParseJSON(input: any): ErrorData<any> {
    try {
        const data = typeof input === 'object' ? input : JSON.parse(input)

        return [null, data]
    } catch (error) {
        return [error, null]
    }
}

export { safeParseJSON }
