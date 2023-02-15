import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from 'auth/user'
import { getModel, userCanAccessModel } from 'models/service'
import { respondAsJson } from 'utils/api'
import { apiError, ErrorCode, HttpException } from 'utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    if (!userCanAccessModel(modelName, user)) {
        return apiError(
            new HttpException(
                ErrorCode.ForbiddenError,
                'User does not have access to the requested model'
            ),
            res
        )
    }

    switch (req.method) {
        case 'GET': {
            const [error, model] = await getModel(modelName, {
                includeId: false,
                populateMacroTemplates: true,
            })

            if (error) {
                return apiError(error, res)
            }

            return respondAsJson(JSON.parse(model.schema), req, res)
        }

        default:
            return res.status(405).end()
    }
}
