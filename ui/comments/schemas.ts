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
