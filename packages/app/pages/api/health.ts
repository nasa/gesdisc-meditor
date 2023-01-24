//import { useRouter } from 'next/router'
import type { NextApiRequest, NextApiResponse } from 'next' 

const healthcheck = {
    services: {
        emailnotifier: {
          isHealthy: true
        }
      }
  }

export default function handler(request: NextApiRequest, response: NextApiResponse) { 
    //response.redirect(`http://localhost/meditor/notifier/`)
  //router.get('/notifier', async (_req, res) => {
    //const res = await fetch('http://localhost/meditor/notifier/')
    try{
        response.status(200).json({healthcheck})
    }catch (err) {
        response.status(500).json({ isHealthy: 'false' })
      }
}


  