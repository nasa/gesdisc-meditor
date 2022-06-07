import { NextApiRequest, NextApiResponse } from 'next'
import { getModels } from '../../models/model'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const models = await getModels()

        res.status(200).json(models)
    } catch (err) {
        console.error(err)
        res.status(500)
    }
}
