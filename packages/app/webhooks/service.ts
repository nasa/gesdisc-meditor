import type { ErrorData } from 'declarations'
import createError from 'http-errors'
import { Message } from 'node-nats-streaming'
import assert from 'node:assert'
import { IncomingMessage } from 'node:http'
import { request } from 'node:https'
import process from 'node:process'
import log from '../lib/log'
import { publishMessageToQueueChannel } from '../lib/nats'
import { encryptData } from '../utils/encrypt'
import { parseZodAsErrorData } from '../utils/errors'
import { safeParseJSON } from '../utils/json'
import { wait } from '../utils/time'
import { WebhookConfigsSchema } from './schema'
import {
    QueueWebhookMessage,
    type AcknowledgementsBearerTokenDecryptedParts,
    type WebhookAcknowledgementPayload,
    type WebhookConfig,
    type WebhookPayload,
} from './types'

const MAX_AGE_MILLISECONDS = 1000 * 60 * 60 * 24 * 10 // roughly ten days
const WEBHOOK_ENV_VAR = 'UI_WEBHOOKS'
const WEBHOOK_NATS_CHANNEL = 'webhooks'

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
 */
// TODO: Once Windmill is hosted on the LB, rewrite this using fetch (remove https.request).
async function invokeWebhook(
    webhook: WebhookConfig,
    payload: WebhookPayload
): Promise<ErrorData<any>> {
    try {
        const payloadWithAcknowledgementUrl =
            getPayloadWithAcknowledgementUrl(payload)
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

        // In this case, the response's status code did not indicate a successful response.
        assert(
            statusCode <= 300,
            Error(
                `Received status code ${statusCode} from invoking webhook URL ${webhook.URL}`
            )
        )

        const [parseError, data] = safeParseJSON(response)

        log.debug(
            `Response from webhook URL ${webhook.URL}: ${JSON.stringify(
                data,
                null,
                4
            )}`
        )

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

/**
 * This function is registered as the handler for webhook messages from the queue.
 * We do not acknowledge on error / timeout so that failed invocations are retried according to the queue configuration.
 * We do acknowledge when the webhook has succeeded, but we do nothing with the response otherwise (invoking webhooks is considered a side effect).
 */
async function handleWebhookInvocationFromQueue(message: Message) {
    try {
        const { config, payload }: QueueWebhookMessage = JSON.parse(
            message.getData() as string
        )
        const dateOfFirstInvocation = message.getTimestamp()
        const isExpired =
            Date.now() > dateOfFirstInvocation.getTime() + MAX_AGE_MILLISECONDS

        // Get the config fresh from the environment in case a token has been invalidated or a URL has changed via environment configuration.
        // The stored configuration is used to match against the current environment. The webhook environment variable accepts multiple configurations, so migrating from one endpoint to another should be done in phases:
        // 1. add new config
        // 2. ensure no failed webhoooks (see logs)
        // 3. remove old config
        const [configError, configFromEnv] = getWebhookConfig(config.URL)

        // If the config stored on the message does not match a currently available URL, we raise an error.
        assert(
            !configError && !!configFromEnv,
            Error(`The webhook URL ${config.URL} did not match a known config.`)
        )

        // Our NATS configuration intentionally does not have a maximum number of retries. To limit an infinite number of failed webhook invokations, we're going to use the date of the first message to roughly estimate when we should stop retrying.
        if (isExpired) {
            message.ack()

            throw Error(
                `The webhook for document ${
                    payload.document[payload.model.titleProperty]
                } has exceeded its max age. No more retries will be attempted.`
            )
        }

        const [error, data] = await invokeWebhook(configFromEnv, payload)

        assert(!error, error)

        message.ack()
    } catch (error) {
        log.error(error)
    }
}

/**
 * Publishes to queue, but does not rethrow any errors. This function is a good choice when a queue publishing failure should not halt the functions lower in the call stack.
 */
function safelyPublishWebhookInvocationToQueue(
    config: WebhookConfig,
    payload: WebhookPayload
) {
    try {
        // No need to await this side effect.
        publishMessageToQueueChannel(WEBHOOK_NATS_CHANNEL, { config, payload })
    } catch (error) {
        log.error(error)
    }
}

export {
    getAllWebhookConfigs,
    getWebhookConfig,
    handleWebhookInvocationFromQueue,
    invokeWebhook,
    safelyPublishWebhookInvocationToQueue,
    WEBHOOK_NATS_CHANNEL,
}
