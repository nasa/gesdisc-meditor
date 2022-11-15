import type { NextApiRequest, NextApiResponse } from 'next'
import { setUpNewInstallation } from '../../../../setup/service'
import { apiError } from '../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST': {
            const [error] = await setUpNewInstallation(req.body)

            if (!!error) {
                return apiError(error)
            }

            return res.status(204).end()
        }

        default:
            return res.status(405).end()
    }
}
