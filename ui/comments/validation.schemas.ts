export const NewDocumentCommentUserInputSchema = {
    required: ['documentId', 'model', 'text'],
    properties: {
        documentId: {
            type: 'string',
        },
        model: {
            type: 'string',
        },
        text: {
            type: 'string',
        },
        parentId: {
            type: 'string',
        },
    },
}

// user can only update the 'text' and 'resolved' fields of a comment after it is created
// oneOf means the user can either update the text field or the resolved field, but not both
export const UpdateDocumentCommentUserInputSchema = {
    oneOf: [
        {
            properties: {
                text: {
                    type: 'string',
                },
            },
            required: ['text'],
        },
        {
            properties: {
                resolved: {
                    type: 'boolean',
                },
            },
            required: ['resolved'],
        },
    ],
}
