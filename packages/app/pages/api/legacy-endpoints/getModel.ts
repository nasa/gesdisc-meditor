import { modelSchema } from './_schemas'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'
import getModelHandler from '../models/[modelName]/'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
    req.query.model = req.query.name
    req.query = modelSchema.parse(req.query)

    return getModelHandler(req, res)
}

export default withApiErrorHandler(handler)
