import type { NextApiRequest, NextApiResponse } from 'next'
import { default as getDocumentHandler } from '../models/[modelName]/documents/[documentTitle]/'
import { default as getDocumentWithVersionHandler } from '../models/[modelName]/documents/[documentTitle]/'
import { documentSchema } from './_schemas'
import { withApiErrorHandler } from 'lib/with-api-error-handler'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
    req.query = documentSchema.parse(req.query)

    return req.query.version
        ? getDocumentWithVersionHandler(req, res)
        : getDocumentHandler(req, res)
}

export default withApiErrorHandler(handler)
