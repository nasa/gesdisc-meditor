import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from 'auth/user'
import { getDocument } from 'documents/service'
import { userCanAccessModel } from 'models/service'
import { respondAsJson } from 'utils/api'
import assert from 'assert'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import createError from 'http-errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    assert(
        await userCanAccessModel(user, modelName),
        new createError.Forbidden('User does not have access to the requested model')
    )

    const [error, document] = await getDocument(documentTitle, modelName, user)

    if (error) {
        throw error
    }

    return respondAsJson(document, req, res)
}

export default withApiErrorHandler(handler)
