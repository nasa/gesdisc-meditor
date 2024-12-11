import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Set-Cookie', [
        `next-auth.session-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    ])

    res.status(204).end()
}
