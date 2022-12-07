import type { NextApiRequest, NextApiResponse } from 'next'
import { getModel } from '../../../../models/service'
import { apiError } from '../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    //* Allow search param to optionally populate macro templates (consumed as boolean attribute).
    const populateMacroTemplates = 'populateMacroTemplates' in req.query

    switch (req.method) {
        case 'GET': {
            const [error, model] = await getModel(modelName, {
                //* Do not expose DB ID to API.
                includeId: false,
                populateMacroTemplates,
            })

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(model)
        }

        default:
            return res.status(405).end()
    }
}
