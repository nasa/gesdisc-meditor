import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/user'
import { getDocument } from '../../../../../../documents/service'
import { apiError } from '../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const documentTitle = req.query.documentTitle.toString()
    const modelName = req.query.modelName.toString()
    const user = await getLoggedInUser(req, res)

    switch (req.method) {
        case 'GET': {
            const [error, document] = await getDocument(
                decodeURIComponent(documentTitle),
                decodeURIComponent(modelName),
                user
            )

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(document)
        }

        //! /putDocument is really only used to create a new document, so it should be a POST to /models/modelName/documents. Remove this...
        case 'PUT': {
            console.log(req.body)
            return res.status(200).json({ message: 'PUT was used' })
        }

        default:
            return res.status(405).end()
    }
}
