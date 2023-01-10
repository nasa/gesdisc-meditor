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
export const UpdateDocumentCommentUserInputSchema = {
    anyOf: [
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
