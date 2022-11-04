import type { NextApiRequest, NextApiResponse } from 'next'
import { setUpNewInstallation } from '../../../../setup/service'
import {
    apiError,
    BadRequestException,
    MethodNotAllowedException,
} from '../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'POST': {
                const [error] = await setUpNewInstallation(req.body)

                if (!!error) {
                    throw new BadRequestException(`mEditor's DB failed to set up.`)
                }

                return res.status(204).end()
            }

            default:
                throw new MethodNotAllowedException()
        }
    } catch (err) {
        return apiError(res, err)
    }
}
