import { AsyncParser } from '@json2csv/node'
import type { NextApiRequest, NextApiResponse } from 'next'
import get from 'lodash.get'

const parser = new AsyncParser()

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
    if ('noOutput' in request.query) {
        // user requested no output, only return the HTTP status code
        return response.status(options.httpStatusCode).end()
    }

    if ('pretty' in request.query) {
        // user requested the JSON output to be prettified
        response.setHeader('Content-Type', 'application/json')
        return response
            .status(options.httpStatusCode)
            .send(JSON.stringify(payload, null, 2))
    }

    // a normal response is minified JSON with the HTTP status code
    return response.status(options.httpStatusCode).json(payload)
}

async function respondAsCsv(
    payload: Serializable,
    request: NextApiRequest,
    response: NextApiResponse,
    options: {
        httpStatusCode?: number // to pass a custom HTTP status code, defaults to `200`
    } = {
        httpStatusCode: 200,
    }
) {
    if ('noOutput' in request.query) {
        // user requested no output, only return the HTTP status code
        return response.status(options.httpStatusCode).end()
    }

    // if ('pretty' in request.query) {
    // see https://juanjodiaz.github.io/json2csv/#/advanced-options/formatters if this is a requested feature
    // }

    response.setHeader('Content-Type', 'text/csv')
    // a normal response is CSV with the HTTP status code
    return response
        .status(options.httpStatusCode)
        .send(await parser.parse(payload as object).promise())
}

export async function respondAs(
    payload: Serializable,
    request: NextApiRequest,
    response: NextApiResponse,
    options: {
        format?: string
        httpStatusCode?: number // to pass a custom HTTP status code, defaults to `200`
        payloadPath?: string | string[]
    }
) {
    const { httpStatusCode = 200 } = options
    const responsePayload = options.payloadPath
        ? get(payload, options.payloadPath)
        : payload

    switch (options.format.toUpperCase()) {
        case 'CSV':
            return await respondAsCsv(responsePayload, request, response, {
                httpStatusCode,
            })

        case 'JSON':
        default:
            return respondAsJson(responsePayload, request, response, {
                httpStatusCode,
            })
    }
}
