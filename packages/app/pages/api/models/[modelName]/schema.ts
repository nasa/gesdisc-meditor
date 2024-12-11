import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from 'auth/user'
import { getModel, userCanAccessModel } from 'models/service'
import { respondAsJson } from 'utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import assert from 'assert'
import createError from 'http-errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    assert(
        await userCanAccessModel(user, modelName),
        new createError.Forbidden('User does not have access to the requested model')
    )

    const [error, model] = await getModel(modelName, {
        includeId: false,
        populateMacroTemplates: true,
    })

    if (error) {
        throw error
    }

    return respondAsJson(JSON.parse(model.schema), req, res)
}

export default withApiErrorHandler(handler)
