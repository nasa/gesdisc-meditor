import type { NextApiRequest, NextApiResponse } from 'next'

const healthcheck = {
    services: {
        emailnotifier: {
            isHealthy: true
        }
    }
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    //fetching response from meditor_notifier whether it is healthy or not
    const response = await fetch(
        'http://meditor_notifier:3000/health')
    const result = await response.json()

    healthcheck.services.emailnotifier.isHealthy = result.isHealthy

    console.log(JSON.stringify(healthcheck, null, 4))
    //To make sure Meditor API it self is healhty
    try {
        res.status(200).json(healthcheck)
    } catch (err) {
        res.status(500).json({ message: 'Meditor API is not healthy', err })
    }
}