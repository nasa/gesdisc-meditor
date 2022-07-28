import { NextApiRequest, NextApiResponse } from 'next'
import { getModel } from '../../../../models/model'
import { apiError } from '../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const model = await getModel(req.query.modelName?.toString(), {
            populateMacroTemplates: true,
            includeId: false,
        })

        res.status(200).json(model)
    } catch (err) {
        return apiError(res, err)
    }
}
