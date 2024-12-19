import type { NextApiRequest, NextApiResponse } from 'next'
import { getModels } from '../../../models/service'
import { respondAsJson } from '../../../utils/api'
import assert from 'assert'
import createError from 'http-errors'
import { withApiErrorHandler } from 'lib/with-api-error-handler'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'GET', new createError.MethodNotAllowed())

    const [error, models] = await getModels()

    if (error) {
        throw error
    }

    return respondAsJson(models, req, res)
}

export default withApiErrorHandler(handler)
