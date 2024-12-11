import type { NextApiRequest, NextApiResponse } from 'next'
import listModelsHandler from '../models/'
import { withApiErrorHandler } from 'lib/with-api-error-handler'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    return listModelsHandler(req, res)
}

export default withApiErrorHandler(handler)
