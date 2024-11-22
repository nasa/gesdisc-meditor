import type { NextApiRequest, NextApiResponse } from 'next'
import { apiError } from 'utils/errors'
import getModelHandler from '../models/[modelName]/'
import { z } from 'zod'

const schema = z
    .object({
        name: z.string().min(1).transform(encodeURIComponent),
    })
    // rename old names to their new, more readable counterparts
    .transform(({ name }) => ({
        modelName: name,
    }))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
        req.query = schema.parse(req.query)

        return getModelHandler(req, res)
    } catch (err) {
        return apiError(err, res)
    }
}
