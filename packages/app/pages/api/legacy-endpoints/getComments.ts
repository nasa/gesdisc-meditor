import type { NextApiRequest, NextApiResponse } from 'next'
import getCommentsHandler from '../models/[modelName]/documents/[documentTitle]/comments/'
import { documentSchema } from './_schemas'
import { withApiErrorHandler } from 'lib/with-api-error-handler'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
    req.query = documentSchema.parse(req.query)

    return getCommentsHandler(req, res)
}

export default withApiErrorHandler(handler)
