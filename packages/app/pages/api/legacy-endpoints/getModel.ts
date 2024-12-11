import type { NextApiRequest, NextApiResponse } from 'next'
import getModelHandler from '../models/[modelName]/'
import { z } from 'zod'
import { withApiErrorHandler } from 'lib/with-api-error-handler'

const schema = z
    .object({
        name: z.string().min(1).transform(encodeURIComponent),
    })
    // rename old names to their new, more readable counterparts
    .transform(({ name }) => ({
        modelName: name,
    }))

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
    req.query = schema.parse(req.query)

    return getModelHandler(req, res)
}

export default withApiErrorHandler(handler)
