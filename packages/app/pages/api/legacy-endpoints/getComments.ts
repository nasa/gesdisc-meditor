import type { NextApiRequest, NextApiResponse } from 'next'
import { apiError } from 'utils/errors'
import getCommentsHandler from '../models/[modelName]/documents/[documentTitle]/comments/'
import { documentSchema } from './_schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
        req.query = documentSchema.parse(req.query)

        return getCommentsHandler(req, res)
    } catch (err) {
        return apiError(err, res)
    }
}
