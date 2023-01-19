import type { NextApiRequest, NextApiResponse } from 'next'

type Serializable = string | object | number | boolean

export function respondAsJson(
    payload: Serializable,
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.query.pretty) {
        response.setHeader('Content-Type', 'application/json')
        return response.status(200).send(JSON.stringify(payload, null, 2))
    }

    return response.status(200).json(payload)
}
