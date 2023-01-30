import type { NextApiRequest, NextApiResponse } from 'next' 

const healthcheck = {
    services: {
        emailnotifier: {
          isHealthy: true
        }
      }
  }

export default async function handler(_req: NextApiRequest, res: NextApiResponse) { 
   
 const response = await fetch(
        'http://meditor_notifier:3000/health')
        const result = await response.json()
       
        healthcheck.services.emailnotifier.isHealthy = result.isHealthy
        try{
            res.status(200).json(healthcheck)
        }catch (err) {
            res.status(500).json({ isHealthy: 'false' })
          }
}