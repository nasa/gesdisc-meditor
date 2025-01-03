import assert from 'assert'
import createError from 'http-errors'
import { getDocument } from 'documents/service'
import { getServerSession } from 'auth/user'
import { respondAsJson } from 'utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import { withUserCanAccessModelCheck } from 'lib/with-user-can-access-model-check'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const session = await getServerSession(req, res)

    const [error, document] = await getDocument(
        documentTitle,
        modelName,
        session.user
    )

    if (error) {
        throw error
    }

    return respondAsJson(document, req, res)
}

export default withApiErrorHandler(withUserCanAccessModelCheck(handler))
