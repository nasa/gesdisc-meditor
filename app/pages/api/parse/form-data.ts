import type { NextApiRequest, NextApiResponse } from 'next'
import * as multipart from 'parse-multipart-data'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST': {
            const { headers, body } = req
            const boundary = multipart.getBoundary(headers['content-type'])
            const parts = multipart.parse(Buffer.from(body), boundary)

            const documents = parts.map(part => {
                return part.data.toString()
            })

            return res.status(200).json(documents)
        }

        default:
            return res.status(405).end()
    }
}
