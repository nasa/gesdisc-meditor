import type { NextApiRequest, NextApiResponse } from 'next'
import listModelsHandler from '../models/'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return listModelsHandler(req, res)
}
