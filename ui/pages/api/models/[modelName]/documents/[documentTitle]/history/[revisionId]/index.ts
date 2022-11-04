import { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentHistoryByVersion } from '../../../../../../../../documents/service'
import {
    apiError,
    MethodNotAllowedException,
    NotFoundException,
} from '../../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET': {
                const { revisionId, documentTitle, modelName } = req.query

                const [error, history] = await getDocumentHistoryByVersion(
                    decodeURIComponent(revisionId.toString()),
                    decodeURIComponent(documentTitle.toString()),
                    decodeURIComponent(modelName.toString())
                )

                if (error || !Object.keys(history).length) {
                    throw new NotFoundException(
                        `Comments not found for model '${modelName}' with document '${documentTitle}' and history ID '${revisionId}'.`
                    )
                }

                return res.status(200).json(history)
            }

            default:
                throw new MethodNotAllowedException()
        }
    } catch (err) {
        return apiError(res, err)
    }
}
