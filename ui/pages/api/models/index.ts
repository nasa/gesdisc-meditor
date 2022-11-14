import type { NextApiRequest, NextApiResponse } from 'next'
import { getModels } from '../../../models/service'
import { apiError, InternalServerErrorException } from '../../../utils/errors'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {
        const [error, models] = await getModels()

        if (error) {
            console.error(error)
            throw new InternalServerErrorException('Failed to retrieve models')
        }

        res.status(200).json(models)
    } catch (err) {
        return apiError(res, err)
    }
}
