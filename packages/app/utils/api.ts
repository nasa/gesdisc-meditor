import type { NextApiRequest, NextApiResponse } from 'next'

type Serializable = string | object | number | boolean

export function respondAsJson(
    payload: Serializable,
    request: NextApiRequest,
    response: NextApiResponse,
    options: {
        httpStatusCode?: number // to pass a custom HTTP status code, defaults to `200`
    } = {
        httpStatusCode: 200,
    }
) {
    if (request.query.noOutput) {
        // user requested no output, only return the HTTP status code
        return response.status(options.httpStatusCode).end()
    }

    if (request.query.pretty) {
        // user requested the JSON output to be prettified
        response.setHeader('Content-Type', 'application/json')
        return response
            .status(options.httpStatusCode)
            .send(JSON.stringify(payload, null, 2))
    }

    // a normal response is minified JSON with the HTTP status code
    return response.status(options.httpStatusCode).json(payload)
}
