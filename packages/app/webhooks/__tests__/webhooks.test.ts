import type { ModelWithWorkflow } from '../../models/types'
import { getAllWebhookConfigs, getWebhookConfig, invokeWebhook } from '../service'

describe('Webhook Service', () => {
    const env = process.env

    beforeAll(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                headers: {
                    get() {
                        return 'text/plain; charset=utf-8'
                    },
                },
                ok: true,
                json: () => Promise.resolve({ foo: 'bar' }),
                text: () => Promise.resolve('foo is bar'),
            })
        ) as jest.Mock
    })

    beforeEach(() => {
        process.env = { ...env }
    })

    afterEach(() => {
        process.env = { ...env }
    })

    describe('getAllWebhookConfigs', () => {
        test('gets all webhook configs as ErrorData', () => {
            // NOTE: this line needs to be left as escaped JSON.
            // prettier-ignore
            process.env.UI_WEBHOOKS =
"[{\"token\":\"an-example-token-for-endpoint-1\",\"URL\":\"http://example.com/1\"}, {\"token\":\"an-example-token-for-endpoint-2\",\"URL\":\"http://example.com/2\"}]"

            const [error, data] = getAllWebhookConfigs()

            expect(error).toBeNull()
            expect(data).toMatchInlineSnapshot(`
                [
                  {
                    "URL": "http://example.com/1",
                    "token": "an-example-token-for-endpoint-1",
                  },
                  {
                    "URL": "http://example.com/2",
                    "token": "an-example-token-for-endpoint-2",
                  },
                ]
            `)
        })
    })

    describe('getWebhookConfig', () => {
        test('gets webhook config, matching by URL', () => {
            // NOTE: this line needs to be left as escaped JSON.
            // prettier-ignore
            process.env.UI_WEBHOOKS =
"[{\"token\":\"an-example-token-for-endpoint-1\",\"URL\":\"http://example.com/1\"}, {\"token\":\"an-example-token-for-endpoint-2\",\"URL\":\"http://example.com/2\"}]"

            const [error, data] = getWebhookConfig('http://example.com/2')

            expect(error).toBeNull()
            expect(data).toMatchInlineSnapshot(`
                {
                  "URL": "http://example.com/2",
                  "token": "an-example-token-for-endpoint-2",
                }
            `)
        })
    })

    describe('invokeWebhook', () => {
        test.skip('TODO: enable once webhook service uses fetch', async () => {
            // test('invokes (fetches) a webhook URL', async () => {
            const fetchSpy = jest.spyOn(global, 'fetch')
            // NOTE: this line needs to be left as escaped JSON.
            // prettier-ignore
            process.env.UI_WEBHOOKS =
"[{\"token\":\"an-example-token-for-endpoint-1\",\"URL\":\"http://example.com/1\"}, {\"token\":\"an-example-token-for-endpoint-2\",\"URL\":\"http://example.com/2\"}]"

            const [configError, webhook] = getWebhookConfig('http://example.com/2')
            const [error, result] = await invokeWebhook(webhook, {
                model: {} as ModelWithWorkflow,
                document: {},
                state: 'Draft',
            })

            expect(configError).toBeNull()
            expect(error).toBeNull()
            expect(result).toMatchInlineSnapshot(`"foo is bar"`)
            expect(fetchSpy).toHaveBeenCalledTimes(1)
        })
    })
})
