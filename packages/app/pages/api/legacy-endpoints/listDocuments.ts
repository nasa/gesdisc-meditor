import type { NextApiRequest, NextApiResponse } from 'next'
import { apiError } from 'utils/errors'
import listDocumentsHandler from '../models/[modelName]/documents/'
import { modelSchema } from './_schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
        req.query = modelSchema.parse(req.query)

        return listDocumentsHandler(req, res)
    } catch (err) {
        return apiError(err, res)
    }
}
