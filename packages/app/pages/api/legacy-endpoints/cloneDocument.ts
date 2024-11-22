import type { NextApiRequest, NextApiResponse } from 'next'
import { apiError } from 'utils/errors'
import cloneDocumentHandler from '../models/[modelName]/documents/[documentTitle]/clone-document'
import { baseDocumentSchema } from './_schemas'
import { z } from 'zod'

const schema = baseDocumentSchema
    .extend({
        newTitle: z.string().min(1).transform(encodeURIComponent),
    })
    .transform(({ model, title, newTitle }) => ({
        modelName: model,
        documentTitle: title,
        newTitle,
    }))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
        req.query = schema.parse(req.query)

        return cloneDocumentHandler(req, res)
    } catch (err) {
        return apiError(err, res)
    }
}
