import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoggedInUser } from '../../../../../../auth/user'
import { cloneDocument } from '../../../../../../documents/service'
import { respondAsJson } from '../../../../../../utils/api'
import assert from 'assert'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import createError from 'http-errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'POST', new createError.MethodNotAllowed())

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const newTitle = decodeURIComponent(req.query.newTitle.toString())
    const user = await getLoggedInUser(req, res)

    const [error, document] = await cloneDocument(
        documentTitle,
        newTitle,
        modelName,
        user
    )

    if (error) {
        throw error
    }

    // todo: discuss this vs createDocument's 201 w/ location header; api-safe?
    return respondAsJson(document, req, res)
}

export default withApiErrorHandler(handler)
