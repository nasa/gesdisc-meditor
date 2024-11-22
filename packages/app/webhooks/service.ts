import type { ErrorData } from 'declarations'
import log from '../lib/log'
import { parseResponse } from '../utils/api'
import { ErrorCode, HttpException, parseZodAsErrorData } from '../utils/errors'
import { safeParseJSON } from '../utils/json'
import { WebhookConfigsSchema } from './schema'
import type { WebhookConfig, WebhookPayload } from './types'

const WEBHOOK_ENV_VAR = 'UI_WEBHOOKS'

function getAllWebhookConfigs(): ErrorData<WebhookConfig[]> {
    try {
        const fromEnvironment = process.env[WEBHOOK_ENV_VAR] ?? []
        const [parseError, JSON] = safeParseJSON(fromEnvironment)
        const [schemaError, webhooks] = parseZodAsErrorData(
            WebhookConfigsSchema,
            JSON
        )

        if (parseError || schemaError) {
            throw parseError || schemaError
        }

        return [null, webhooks as WebhookConfig[]]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

function getWebhookConfig(URL: WebhookConfig['URL']): ErrorData<WebhookConfig> {
    try {
        const [error, webhooks] = getAllWebhookConfigs()

        if (error) {
            throw error
        }

        const [webhook = null] = webhooks.filter(webhook => webhook.URL === URL)

        return [null, webhook]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

async function invokeWebhook(
    webhook: WebhookConfig,
    payload: WebhookPayload
): Promise<ErrorData<any>> {
    try {
        const response = await fetch(webhook.URL, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${webhook.token}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw new HttpException(response.status, response.statusText)
        }

        return [null, await parseResponse(response)]
    } catch (error) {
        return [error, null]
    }
}

export { getAllWebhookConfigs, getWebhookConfig, invokeWebhook }
