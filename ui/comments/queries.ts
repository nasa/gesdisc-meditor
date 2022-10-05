import { ObjectId } from 'mongodb'

function getCommentForDocumentQuery({
    commentId,
    documentTitle,
    modelName,
}: {
    commentId: string
    documentTitle: string
    modelName: string
}) {
    const query: any[] = [
        {
            $match: {
                $and: [
                    {
                        documentId: documentTitle,
                        model: modelName,
                        _id: new ObjectId(commentId),
                    },
                ],
            },
        },
    ]

    return query
}

function getCommentsForDocumentQuery({
    documentTitle,
    modelName,
}: {
    documentTitle: string
    modelName: string
}) {
    const query: any[] = [
        { $match: { $and: [{ documentId: documentTitle, model: modelName }] } },
    ]

    return query
}

export { getCommentsForDocumentQuery, getCommentForDocumentQuery }
