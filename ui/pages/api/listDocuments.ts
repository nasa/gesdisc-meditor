import { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentsForModel } from '../../models/document'
import { apiError } from '../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const documents = await getDocumentsForModel(req.query.model as string)

        return res.status(200).json(documents)
    } catch (err) {
        return apiError(res, err)
    }
}
