import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../auth/user'
import { getModel, userCanAccessModel } from '../../../../models/service'
import { apiError, ErrorCode, HttpException } from '../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = req.query.modelName.toString()
    const user = await getLoggedInUser(req, res)

    if (!userCanAccessModel(modelName, user)) {
        throw new HttpException(
            ErrorCode.ForbiddenError,
            'User does not have access to the requested model'
        )
    }

    switch (req.method) {
        case 'GET': {
            const [error, model] = await getModel(decodeURIComponent(modelName))

            if (error) {
                return apiError(error, res)
            }

            return res.status(200).json(model)
        }

        default:
            return res.status(405).end()
    }
}
