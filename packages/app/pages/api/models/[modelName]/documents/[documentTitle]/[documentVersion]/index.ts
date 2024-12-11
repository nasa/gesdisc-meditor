import assert from 'assert'
import createError from 'http-errors'
import { getDocument } from '../../../../../../../documents/service'
import { getLoggedInUser } from '../../../../../../../auth/user'
import { respondAsJson } from '../../../../../../../utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const documentVersion = decodeURIComponent(req.query.documentVersion.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const user = await getLoggedInUser(req, res)

    const [error, document] = await getDocument(
        documentTitle,
        modelName,
        user,
        documentVersion
    )

    if (error) {
        throw error
    }

    return respondAsJson(document, req, res)
}

export default withApiErrorHandler(handler)
