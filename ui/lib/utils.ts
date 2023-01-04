/**
 * given all of, or a portion of, a JSON schema, will do a deep search for a given key
 * 
 * @param key 
 * @param schema
 * @returns boolean whether the key exists in the schema or not 
 */
export const keyExistsInSchema = (key: string, schema: any): boolean => {
    if (key in schema) {
        return true
    }

    if ('items' in schema) {
        return keyExistsInSchema(key, schema.items)
    }

    // loop over each property in the schema and return the result of each property search
    if ('properties' in schema) {
        return Object.keys(schema.properties).reduce((keyExists, propertyKey) => {
            // already found it, so keep returning true
            if (keyExists) {
                return true
            }

            return keyExistsInSchema(key, schema.properties[propertyKey])
        }, false)
    }

    return false
}