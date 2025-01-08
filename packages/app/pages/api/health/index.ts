import { withApiErrorHandler } from 'lib/with-api-error-handler'
import type { NextApiRequest, NextApiResponse } from 'next'

const healthcheck = {
    services: {
        email_notifier: {
            isHealthy: true,
        },
    },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    //timeout for fetch request sice meditor_notifier is an internal service
    const controller = new AbortController()

    try {
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        //fetching response from meditor_notifier whether it is healthy or not
        const response = await fetch('http://meditor_notifier:3000/health', {
            signal: controller.signal,
        })
        clearTimeout(timeoutId)

        const result = await response.json()

        healthcheck.services.email_notifier.isHealthy = result.isHealthy

        //To make sure Meditor API it self is healhty
        res.status(200).send(JSON.stringify(healthcheck, null, 2))
    } catch (err) {
        console.error(err)

        res.status(500).json({ message: 'Meditor API is not healthy', err })
    }
}

export default withApiErrorHandler(handler)
