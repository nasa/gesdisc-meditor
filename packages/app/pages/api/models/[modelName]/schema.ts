import assert from 'assert'
import createError from 'http-errors'
import { getModel } from 'models/service'
import { respondAsJson } from 'utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import { withUserCanAccessModelCheck } from 'lib/with-user-can-access-model-check'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const modelName = decodeURIComponent(req.query.modelName.toString())

    const [error, model] = await getModel(modelName, {
        includeId: false,
        populateMacroTemplates: true,
    })

    if (error) {
        throw error
    }

    return respondAsJson(JSON.parse(model.schema), req, res)
}

export default withApiErrorHandler(withUserCanAccessModelCheck(handler))
