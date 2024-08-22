/**
 * cleans up schema validation error messages
 * error messages can include things like enums that are very large
 */
export function formatValidationErrorMessage(error: any) {
    let enumKey = 'enum values:'

    // enum values can be very large, remove enum values from error messages
    let message =
        error.message.indexOf(enumKey) > -1
            ? error.message.substring(
                  0,
                  error.message.indexOf(enumKey) + enumKey.length - 1
              )
            : error.message
    let stack =
        error.stack.indexOf(enumKey) > -1
            ? error.stack.substring(
                  0,
                  error.stack.indexOf(enumKey) + enumKey.length - 1
              )
            : error.stack

    return {
        property: error.property,
        name: error.name,
        argument:
            error.argument && error.argument.length <= 100 ? error.argument : [],
        message,
        stack,
    }
}

export function isJson(data: string) {
    try {
        JSON.parse(data)

        return true
    } catch (error) {
        return false
    }
}

type FlattenedSchema = {
    key: string
    schema: {
        type: string
        title: string
        description?: string
    }
    items?: {
        type: string
    }
}

export function flattenSchema(schema, prefix = ''): FlattenedSchema[] {
    let result = []

    if (prefix != '') {
        result.push({
            key: prefix,
            schema: {
                title: schema.title,
                description: schema.description,
                type: schema.type,
            },
            ...(schema.items && {
                items: {
                    type: schema.items.type,
                },
            }),
        })
    }

    // `object` and `array` of `object` case
    // if the schema contains object properties, we'll recurse into each object property
    if (schema.properties || schema.items?.properties) {
        for (let [key, value] of Object.entries(
            schema.properties || schema.items.properties
        )) {
            result = result.concat(
                flattenSchema(value, prefix ? `${prefix}.${key}` : key)
            )
        }
    }

    return result
}
