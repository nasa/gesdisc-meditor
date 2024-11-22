import type { NextApiRequest, NextApiResponse } from 'next'
import { apiError } from 'utils/errors'
import { default as getDocumentHandler } from '../models/[modelName]/documents/[documentTitle]/'
import { default as getDocumentWithVersionHandler } from '../models/[modelName]/documents/[documentTitle]/'
import { documentSchema } from './_schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
        req.query = documentSchema.parse(req.query)

        return req.query.version
            ? getDocumentWithVersionHandler(req, res)
            : getDocumentHandler(req, res)
    } catch (err) {
        return apiError(err, res)
    }
}
