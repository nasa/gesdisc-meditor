import { basePath } from 'auth/providers/earthdata-login'
import log from 'lib/log'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // construct our internal callback url to generate a NextAuth session after .netrc authentication to EDL
    const callbackUrl = `${process.env.HOST}/api/legacy-endpoints/netrc-callback`

    // construct the redirect URL to urs.earthdata.nasa.gov
    // https://urs.earthdata.nasa.gov/documentation/for_integrators/api_documentation#POST/oauth/authorize
    const earthdataAuthUrl = `${basePath}/oauth/authorize?client_id=${
        process.env.AUTH_CLIENT_ID
    }&scope=openid&splash=false&response_type=code&redirect_uri=${encodeURIComponent(
        callbackUrl
    )}`

    log.debug('Starting .netrc login. Authorize URL: ', earthdataAuthUrl)

    // redirect the user to EDL
    // remember, on successful login, EDL will then redirect to our `callbackUrl` above
    res.redirect(302, earthdataAuthUrl)
}
