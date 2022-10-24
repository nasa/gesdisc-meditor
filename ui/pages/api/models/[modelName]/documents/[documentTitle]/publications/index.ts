import { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentPublications } from '../../../../../../../documents/service'
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
                const [error, publications] = await getDocumentPublications(
                    decodeURIComponent(documentTitle),
                    decodeURIComponent(modelName)
                )

                if (error || !publications.length) {
                    throw new NotFoundException(
                        `Publications not found for model '${modelName}' with document '${documentTitle}'.`
                    )
                }

                return res.status(200).json(publications)
            }

            default:
                throw new MethodNotAllowedException()
        }
    } catch (err: any) {
        return apiError(res, err)
    }
}
