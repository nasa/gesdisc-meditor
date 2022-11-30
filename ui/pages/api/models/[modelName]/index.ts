import type { NextApiRequest, NextApiResponse } from 'next'
import { getModel } from '../../../../models/service'
import { apiError } from '../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = req.query.modelName.toString()

    switch (req.method) {
        case 'GET': {
            // todo: refactor to ErrorData tuple when getModel is refactored.
            const [error, model] = await getModel(decodeURIComponent(modelName))

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(model)
        }

        default:
            return res.status(405).end()
    }
}
