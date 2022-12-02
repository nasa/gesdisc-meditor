import type { NextApiRequest, NextApiResponse } from 'next'
import { getModel } from '../../../../models/service'
import { apiError } from '../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())

    switch (req.method) {
        case 'GET': {
            const [error, model] = await getModel(modelName)

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(model)
        }

        default:
            return res.status(405).end()
    }
}
