import type { NextApiRequest, NextApiResponse } from 'next'
import { apiError } from 'utils/errors'
import changeDocumentStateHandler from '../models/[modelName]/documents/[documentTitle]/change-document-state'
import { baseDocumentSchema } from './_schemas'
import { z } from 'zod'

const schema = baseDocumentSchema
    .extend({
        state: z.string().min(1).transform(encodeURIComponent),
    })
    .transform(({ model, title, state }) => ({
        modelName: model,
        documentTitle: title,
        state,
    }))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
        req.query = schema.parse(req.query)
        req.method = req.method === 'GET' ? 'POST' : req.method // old API used GET, new API uses POST

        return changeDocumentStateHandler(req, res)
    } catch (err) {
        return apiError(err, res)
    }
}
