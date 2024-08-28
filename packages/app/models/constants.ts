// a small JSONSchema for validating the `x-meditor` fields in a document
export const xMeditorSchema = {
    state: {
        type: 'string',
    },
    modifiedBy: {
        type: 'string',
    },
    modifiedOn: {
        type: 'string',
    },
}
