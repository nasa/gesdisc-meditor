import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    // TODO: implement
    res.status(501).json({
        message: 'Not Implemented',
    })
}
