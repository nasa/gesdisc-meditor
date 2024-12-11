import assert from 'assert'
import createError from 'http-errors'
import { getLoggedInUser } from 'auth/user'
import { getModel, userCanAccessModel } from 'models/service'
import { respondAsJson } from 'utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const modelName = decodeURIComponent(req.query.modelName.toString())
    const disableMacros = 'disableMacros' in req.query
    const user = await getLoggedInUser(req, res)

    assert(
        await userCanAccessModel(user, modelName),
        new createError.Forbidden('User does not have access to the requested model')
    )

    const [error, model] = await getModel(modelName, {
        //* Do not expose DB ID to API.
        includeId: false,
        //* Allow boolean search param to optionally disable template macros. Defaults to running macros.
        populateMacroTemplates: !disableMacros,
    })

    if (error) {
        throw error
    }

    return respondAsJson(model, req, res)
}

export default withApiErrorHandler(handler)
