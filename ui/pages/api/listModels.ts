import { NextApiRequest, NextApiResponse } from 'next'
import { getModels } from '../../models/model'
import { apiError } from '../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const models = await getModels()

        res.status(200).json(models)
    } catch (err) {
        return apiError(res, err)
    }
}
