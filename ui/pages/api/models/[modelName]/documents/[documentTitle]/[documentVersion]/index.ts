import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../../auth/user'
import { getDocument } from '../../../../../../../documents/service'
import {
    apiError,
    MethodNotAllowedException,
    NotFoundException,
} from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const documentTitle = req.query.documentTitle.toString()
        const documentVersion = req.query.documentVersion.toString()
        const modelName = req.query.modelName.toString()
        const user = await getLoggedInUser(req, res)

        switch (req.method) {
            case 'GET': {
                const [error, document] = await getDocument(
                    decodeURIComponent(documentTitle),
                    decodeURIComponent(modelName),
                    user,
                    decodeURIComponent(documentVersion)
                )

                if (error || !Object.keys(document).length) {
                    throw new NotFoundException(
                        `Document not found for model '${modelName}' with document '${documentTitle}' at version ${documentVersion}.`
                    )
                }

                return res.status(200).json(document)
            }

            default:
                throw new MethodNotAllowedException()
        }
    } catch (error) {
        return apiError(res, error)
    }
}
