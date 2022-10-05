import { NextApiRequest, NextApiResponse } from 'next'
import { getCommentsForDocument } from '../../../../../../../comments/service'
import { apiError } from '../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET': {
                const { documentTitle, modelName } = req.query

                const comments = await getCommentsForDocument({
                    documentTitle: decodeURIComponent(documentTitle.toString()),
                    modelName: decodeURIComponent(modelName.toString()),
                })

                return res.status(200).json(comments)
            }

            default:
                return res.status(405).json({ message: 'Method Not Allowed' })
        }
    } catch (err) {
        return apiError(res, err)
    }
}
