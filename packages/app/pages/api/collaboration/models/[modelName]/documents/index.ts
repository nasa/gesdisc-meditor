import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        default:
            return res.status(405).end()
    }
}
