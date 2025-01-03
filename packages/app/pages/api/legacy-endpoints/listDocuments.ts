import type { NextApiRequest, NextApiResponse } from 'next'
import listDocumentsHandler from '../models/[modelName]/documents/'
import { modelSchema } from './_schemas'
import { withApiErrorHandler } from 'lib/with-api-error-handler'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
    req.query = modelSchema.parse(req.query)

    return listDocumentsHandler(req, res)
}

export default withApiErrorHandler(handler)
