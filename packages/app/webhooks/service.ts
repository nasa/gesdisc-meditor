import type { ErrorData } from 'declarations'
import createError from 'http-errors'
import assert from 'node:assert'
import { IncomingMessage } from 'node:http'
import { request } from 'node:https'
import process from 'node:process'
import log from '../lib/log'
import { encryptData } from '../utils/encrypt'
import { parseZodAsErrorData } from '../utils/errors'
import { safeParseJSON } from '../utils/json'
import { wait } from '../utils/time'
import { getWebhooksDb } from './db'
import { WebhookConfigsSchema } from './schema'
import {
    type AcknowledgementsBearerTokenDecryptedParts,
    type WebhookAcknowledgementPayload,
    type WebhookConfig,
    type WebhookPayload,
} from './types'

const RETRY_FAILED_WEBHOOKS_EVERY = 1000 * 10 // ten seconds
const WEBHOOK_ENV_VAR = 'UI_WEBHOOKS'

function getAllWebhookConfigs(): ErrorData<WebhookConfig[]> {
    try {
        const fromEnvironment = process.env[WEBHOOK_ENV_VAR] ?? []
        const [parseError, JSON] = safeParseJSON(fromEnvironment)
        const [schemaError, webhooks] = parseZodAsErrorData(
            WebhookConfigsSchema,
            JSON
        )

        assert(!(parseError || schemaError), parseError || schemaError)

        return [null, webhooks as WebhookConfig[]]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

function getWebhookConfig(URL: WebhookConfig['URL']): ErrorData<WebhookConfig> {
    try {
        const [error, webhooks] = getAllWebhookConfigs()

        assert(!error, error)

        const [webhook = null] = webhooks.filter(webhook => webhook.URL === URL)

        return [null, webhook]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}
/**
 * WEBHOOKS
 * The basic flow is that on saveDocument or changeDocumentState, webhooks are invoked if a valid webhook configuration is found on the workflow edge we are crossing.
 * Our design for webhooks in mEditor is that
 * 1. sucessful responses are stored in the database for a short time (like 30 days) and then removed
 * 2. failed responses are stored in the database; a random failure is pulled from the database every "n" seconds and retried; if it is successful, it now falls under #1
 * 3. timeouts are thrown as an error, stored in the database, and never retried; deleted after a longer period of time (like 90 days)
 */

// TODO:
// timeouts ( 60 seconds) get logged as error, stored, not retried
// write a test script to stress test this
// TODO: Once Windmill is hosted on the LB, rewrite this using fetch.
async function invokeWebhook(
    webhook: WebhookConfig,
    payload: WebhookPayload
): Promise<ErrorData<any>> {
    try {
        const webhookDb = await getWebhooksDb()
        const payloadWithAcknowledgementUrl =
            getPayloadWithAcknowledgementUrl(payload)

        log.debug(
            `Sending webhook payload to ${webhook.URL}: ${JSON.stringify(
                payloadWithAcknowledgementUrl
            )}`
        )

        const { hostname, pathname } = new URL(webhook.URL)

        let numIterations = 0
        let response = ''
        let responseReady = false
        let statusCode = null
        let statusMessage = ''

        const req = request(
            {
                hostname: hostname,
                port: 443,
                path: pathname,
                rejectUnauthorized: false,
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${webhook.token}`,
                    'content-type': 'application/json',
                },
            },
            (res: IncomingMessage) => {
                res.on('data', data => {
                    response += data
                })

                res.on('error', _error => {
                    throw createError(res.statusCode, res.statusMessage)
                })

                res.on('end', async () => {
                    statusCode = res.statusCode
                    statusMessage = res.statusMessage
                    responseReady = true
                })
            }
        )

        req.on('error', error => {
            log.error(
                `The webhook service could not make a request: ${JSON.stringify(
                    error
                )}`
            )
        })

        req.write(JSON.stringify(payloadWithAcknowledgementUrl))

        req.end()

        // Because of using callbacks, we need to pause until the response is complete, but we need to allow for a timeout.
        while (!responseReady && numIterations < 60) {
            await wait(1000)

            numIterations += 1
        }

        // In this case, we have waited over a minute with no response end, so we call this timed out.
        assert(
            responseReady,
            Error(
                `mEditor timed out when attempting to call a webhook for document ${
                    payload.document[payload.model.titleProperty]
                }`
            )
        )

        await webhookDb.upsertResult({
            uid: payload.document[payload.model.titleProperty],
            responseData: response,
            statusCode,
            statusMessage,
            webhook: { URL: webhook.URL }, // no need to store the token; we'll read it from the enviroment for retries in case of token invalidation
            payload,
            // isTimeout: !responseReady,
            isTimeout: true,
        })

        const [parseError, data] = safeParseJSON(response)

        assert(!parseError, parseError)

        return [null, data]
    } catch (error) {
        return [error, null]
    }
}

function getPayloadWithAcknowledgementUrl(
    payload: WebhookPayload
): WebhookPayload & WebhookAcknowledgementPayload {
    return {
        ...payload,
        acknowledgementUrl: `${process.env.HOST}/api/publication-acknowledgements`,

        // provide a bearer token the acknowledger MUST include to allow for updating a documents publication status
        acknowledgementBearerToken:
            encryptData<AcknowledgementsBearerTokenDecryptedParts>({
                _id: payload.document._id,
                modelName: payload.model.name,
            }),
    }
}

async function retryRandomWebhook() {
    log.warn('retryRandomWebhook', Date.now())
    const webhookDb = await getWebhooksDb()
    const document = await webhookDb.getRandomFailedWebhook()

    if (document) {
        const [error, config] = getWebhookConfig(document.webhook.URL) // Get the current token from the environment.

        assert(!error, error)

        await invokeWebhook(
            { URL: document.webhook.URL, token: config.token },
            document.payload
        )
    }
}

;(RETRY_FAILED_WEBHOOKS_EVERY => {
    let id = null

    // Only kick this off once.
    if (!id) {
        id = globalThis.setInterval(async () => {
            await retryRandomWebhook()
        }, RETRY_FAILED_WEBHOOKS_EVERY)
    }
})(RETRY_FAILED_WEBHOOKS_EVERY)

export { getAllWebhookConfigs, getWebhookConfig, invokeWebhook }
