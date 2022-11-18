import type { NextApiRequest, NextApiResponse } from 'next'
import { getModels } from '../../../models/service'
import { apiError } from '../../../utils/errors'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const [error, models] = await getModels()

    if (error) {
        console.error(error)
        return apiError(error, res)
    }

    res.status(200).json(models)
}
