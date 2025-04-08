import { baseDocumentSchema } from './_schemas'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import { z } from 'zod'
import type { NextApiRequest, NextApiResponse } from 'next'
import changeDocumentStateHandler from '../models/[modelName]/documents/[documentTitle]/change-document-state'

const schema = baseDocumentSchema
    .extend({
        state: z.string().min(1).transform(encodeURIComponent),
    })
    .transform(({ model, title, state }) => ({
        modelName: model,
        documentTitle: title,
        state,
    }))

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
    req.query = {
        ...req.query,
        ...schema.parse(req.query),
    }
    req.method = req.method === 'GET' ? 'POST' : req.method // old API used GET, new API uses POST

    return changeDocumentStateHandler(req, res)
}

export default withApiErrorHandler(handler)
