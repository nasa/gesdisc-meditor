import jsonpath from 'jsonpath'
import getDb from '../../lib/mongodb'
import { getModel } from '../../models/service'
import GLDAS_CLM10SUBP_3H_001 from '../../models/__tests__/__fixtures__/collection-metadata/GLDAS_CLM10SUBP_3H_001.json'
import OML1BRVG_003 from '../../models/__tests__/__fixtures__/collection-metadata/OML1BRVG_003.json'
import collectionMetadataModel from '../../models/__tests__/__fixtures__/models/collection-metadata.json'
import { getAllWebhookURLs } from '../service'
import faqsModelWithOneMacro from './__fixtures__/faqs-model-one-macro.json'

describe('Template Macros', () => {
    const env = process.env
    let db

    beforeAll(async () => {
        db = await getDb()

        await db.collection('Models').insertOne(faqsModelWithOneMacro)
        await db.collection('Models').insertOne(collectionMetadataModel)
        await db.collection('Collection Metadata').insertOne(GLDAS_CLM10SUBP_3H_001)
        await db.collection('Collection Metadata').insertOne(OML1BRVG_003)
    })

    afterAll(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Collection Metadata').deleteMany({})
    })

    beforeEach(() => {
        process.env = { ...env }
    })

    afterEach(() => {
        process.env = { ...env }
    })

    describe('list', () => {
        it('gets values from the path to populate the schema', async () => {
            const [error, model] = await getModel('FAQs', {
                includeId: false,
                populateMacroTemplates: true,
            })
            const schema = JSON.parse(model.schema)
            const [firstTemplate] = model.templates

            expect(error).toBeNull()
            expect(jsonpath.value(schema, firstTemplate.jsonpath))
                .toMatchInlineSnapshot(`
                Array [
                  "GLDAS_CLM10SUBP_3H_001",
                  "OML1BRVG_003",
                ]
            `)
        })

        it('does not return duplicate values', async () => {
            const docToDuplicate = await db
                .collection('Collection Metadata')
                .findOne({ Combined_EntryID: 'OML1BRVG_003' })

            delete docToDuplicate._id
            await db.collection('Collection Metadata').insertOne(docToDuplicate)

            const duplicateDocuments = await db
                .collection('Collection Metadata')
                .find({ Combined_EntryID: 'OML1BRVG_003' })
                .toArray()

            //* We have two documents with the same title.
            expect(duplicateDocuments.length).toBe(2)

            const [error, model] = await getModel('FAQs', {
                includeId: false,
                populateMacroTemplates: true,
            })
            const schema = JSON.parse(model.schema)
            const [firstTemplate] = model.templates

            expect(error).toBeNull()
            expect(jsonpath.value(schema, firstTemplate.jsonpath))
                .toMatchInlineSnapshot(`
                Array [
                  "GLDAS_CLM10SUBP_3H_001",
                  "OML1BRVG_003",
                ]
            `)
        })
    })

    describe('webhooks', () => {
        test('gets webhook URLs as ErrorData', async () => {
            // NOTE: this line needs to be left as escaped JSON.
            // prettier-ignore
            process.env.UI_WEBHOOKS =
"[{\"token\":\"an-example-token-for-endpoint-1\",\"URL\":\"http://example.com/1\"}]"

            const [error, webhookURLs] = await getAllWebhookURLs()

            expect(error).toBeNull()
            expect(webhookURLs).toMatchInlineSnapshot(`
                Array [
                  "http://example.com/1",
                ]
            `)
        })

        test('requires escaped JSON only because the env parser does', async () => {
            process.env.UI_WEBHOOKS =
                '[{"token":"an-example-token-for-endpoint-1","URL":"http://example.com/1"}]'

            const [stringError, stringWebhookURLs] = await getAllWebhookURLs()

            expect(stringError).toBeNull()
            expect(stringWebhookURLs).toMatchInlineSnapshot(`
                Array [
                  "http://example.com/1",
                ]
            `)

            // @ts-ignore
            process.env.UI_WEBHOOKS = [
                {
                    token: 'an-example-token-for-endpoint-1',
                    URL: 'http://example.com/1',
                },
            ]

            const [literalError, literalWebhookURLs] = await getAllWebhookURLs()

            expect(literalError).toBeNull()
            expect(literalWebhookURLs).toMatchInlineSnapshot(`
                Array [
                  "http://example.com/1",
                ]
            `)
        })

        test('handles unset and nullish env values', async () => {
            process.env.UI_WEBHOOKS = null

            const [nullError, nullWebhookURLs] = await getAllWebhookURLs()

            expect(nullError).toBeNull()
            expect(nullWebhookURLs).toMatchInlineSnapshot(`Array []`)

            // @ts-ignore
            delete process.env.UI_WEBHOOKS

            const [unsetError, unsetWebhookURLs] = await getAllWebhookURLs()

            expect(unsetError).toBeNull()
            expect(unsetWebhookURLs).toMatchInlineSnapshot(`Array []`)
        })
    })
})
