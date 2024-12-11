import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Set-Cookie', [
        `next-auth.session-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    ])

    res.status(204).end()
}

export default withApiErrorHandler(handler)
