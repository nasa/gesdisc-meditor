import { getServerSession as getServerSessionNextAuth } from 'next-auth'
import { authOptions } from 'pages/api/auth/[...nextauth]'

/**
 * a wrapper over the NextAuth getServerSession
 *
 *? This doesn't seem necessary but the API has changed multiple times and is a bit verbose to use as every page would need to import
 *? both getServerSession() and authOptions. This simplifies it a bit and abstracts away NextAuth from being used throughout the app
 */
export async function getServerSession(req: any, res: any) {
    return getServerSessionNextAuth(req, res, authOptions)
}
