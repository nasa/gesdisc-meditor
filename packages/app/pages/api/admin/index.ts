import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'
import createError from 'http-errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    throw createError.NotImplemented()
}

export default withApiErrorHandler(handler)
