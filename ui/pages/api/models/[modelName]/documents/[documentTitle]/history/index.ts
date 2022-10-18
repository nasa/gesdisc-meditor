import { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentHistory } from '../../../../../../../documents/service'
import {
    apiError,
    MethodNotAllowedException,
    NotFoundException,
} from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const modelName = req.query.modelName.toString()
        const documentTitle = req.query.documentTitle.toString()

        switch (req.method) {
            case 'GET': {
                const [error, history] = await getDocumentHistory(
                    decodeURIComponent(documentTitle),
                    decodeURIComponent(modelName)
                )

                if (error || !history.length) {
                    throw new NotFoundException(
                        `History not found for model '${modelName}' with document '${documentTitle}'.`
                    )
                }

                return res.status(200).json(history)
            }

            default:
                throw new MethodNotAllowedException()
        }
    } catch (err: any) {
        return apiError(res, err)
    }
}
