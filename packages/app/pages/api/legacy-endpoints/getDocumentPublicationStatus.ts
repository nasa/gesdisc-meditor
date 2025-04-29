import { documentSchema } from './_schemas'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'
import getDocumentPublicationStatusHandler from '../models/[modelName]/documents/[documentTitle]/publications/'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
    req.query = {
        ...req.query,
        ...documentSchema.parse(req.query),
    }

    return getDocumentPublicationStatusHandler(req, res)
}

export default withApiErrorHandler(handler)
