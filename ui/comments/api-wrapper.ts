/**
 * Wrapper functions for working with the Comments API on the client side
 */

import { CreateCommentUserInput } from './types'

function getCommentsApiUrl(modelName: string, documentTitle: string) {
    return `/meditor/api/models/${encodeURIComponent(
        modelName
    )}/documents/${encodeURIComponent(documentTitle)}/comments`
}

export default {
    async postComment(comment: CreateCommentUserInput) {
        let apiUrl = getCommentsApiUrl(comment.model, comment.documentId)

        return fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(comment),
            headers: {
                'Content-Type': 'application/json',
            },
        })
    },
}
