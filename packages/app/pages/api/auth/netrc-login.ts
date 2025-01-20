import log from 'lib/log'
import { basePath } from 'auth/providers/earthdata-login'
import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'
import { fromDockerSecretOrEnv } from './[...nextauth]'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // construct our internal callback url to generate a NextAuth session after .netrc authentication to EDL
    const callbackUrl = `${process.env.HOST}/api/auth/netrc-callback`

    // construct the redirect URL to urs.earthdata.nasa.gov
    // https://urs.earthdata.nasa.gov/documentation/for_integrators/api_documentation#POST/oauth/authorize
    const earthdataAuthUrl = `${basePath}/oauth/authorize?client_id=${fromDockerSecretOrEnv(
        'AUTH_CLIENT_ID'
    )}&scope=openid&splash=false&response_type=code&redirect_uri=${encodeURIComponent(
        callbackUrl
    )}`

    log.debug('Starting .netrc login. Authorize URL: ', earthdataAuthUrl)

    // redirect the user to EDL
    // remember, on successful login, EDL will then redirect to our `callbackUrl` above
    res.redirect(302, earthdataAuthUrl)
}

export default withApiErrorHandler(handler)
