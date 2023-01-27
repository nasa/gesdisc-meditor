//import { useRouter } from 'next/router'
import type { NextApiRequest, NextApiResponse } from 'next' 


const healthcheck = {
    services: {
        emailnotifier: {
          isHealthy: true
        }
      }
  }

export default async function handler(request: NextApiRequest, response: NextApiResponse) { 
   
 const res = await fetch(
        'http://meditor_notifier:3000/health')
        const result = await res.json()
       
        healthcheck.services.emailnotifier.isHealthy = result.isHealthy
        try{
            response.status(200).json(healthcheck)
        }catch (err) {
            response.status(500).json({ isHealthy: 'false' })
          }
}