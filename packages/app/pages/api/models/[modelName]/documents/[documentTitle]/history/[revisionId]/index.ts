import assert from 'assert'
import createError from 'http-errors'
import { getDocumentHistory } from '../../../../../../../../documents/service'
import { respondAsJson } from '../../../../../../../../utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const revisionId = decodeURIComponent(req.query.revisionId.toString())

    const [error, history] = await getDocumentHistory(
        documentTitle,
        modelName,
        revisionId
    )

    if (error) {
        throw error
    }

    return respondAsJson(history, req, res)
}

export default withApiErrorHandler(handler)
