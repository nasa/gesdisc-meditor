import type { NextApiRequest, NextApiResponse } from 'next'
import { getModels } from '../../../models/service'
import { apiError } from '../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET': {
            const [error, models] = await getModels()

            if (error) {
                return apiError(error, res)
            }

            res.status(200).json(models)
        }

        default:
            return res.status(405)
    }
}
