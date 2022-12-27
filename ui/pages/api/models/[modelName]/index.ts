import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../auth/user'
import { getModel, userCanAccessModel } from '../../../../models/service'
import { apiError, ErrorCode, HttpException } from '../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const disableMacros = 'disableMacros' in req.query
    const user = await getLoggedInUser(req, res)

    if (!userCanAccessModel(modelName, user)) {
        throw new HttpException(
            ErrorCode.ForbiddenError,
            'User does not have access to the requested model'
        )
    }

    switch (req.method) {
        case 'GET': {
            const [error, model] = await getModel(modelName, {
                //* Do not expose DB ID to API.
                includeId: false,
                //* Allow boolean search param to optionally disable template macros. Defaults to running macros.
                populateMacroTemplates: !disableMacros,
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
