import assert from 'assert'
import createError from 'http-errors'
import { getDocumentPublications } from '../../../../../../../documents/service'
import { respondAsJson } from '../../../../../../../utils/api'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const modelName = decodeURIComponent(req.query.modelName.toString())

    const [error, publications] = await getDocumentPublications(
        documentTitle,
        modelName
    )

    if (error) {
        throw error
    }

    return respondAsJson(publications, req, res)
}

export default withApiErrorHandler(handler)
