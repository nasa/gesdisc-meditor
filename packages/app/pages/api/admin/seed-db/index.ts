import type { NextApiRequest, NextApiResponse } from 'next'
import { setUpNewInstallation } from '../../../../setup/service'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import assert from 'assert'
import createError from 'http-errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    assert(req.method === 'POST', new createError.MethodNotAllowed())

    const [error] = await setUpNewInstallation(req.body)

    if (!!error) {
        throw error
    }

    return res.status(204).end()
}

export default withApiErrorHandler(handler)
