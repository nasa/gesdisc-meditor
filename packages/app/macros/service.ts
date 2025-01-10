import assert from 'assert'
import cloneDeep from 'lodash.clonedeep'
import createError from 'http-errors'
import log from '../lib/log'
import { DocumentRepository } from '../documents/repository'
import { getAllWebhookConfigs } from '../webhooks/service'
import type { ErrorData } from '../declarations'
import type { Model, PopulatedTemplate, Template } from '../models/types'

//* Macros are a map of external to internal: externally, mEditor can have template macros defined. Those macros have names. Internally, we make those macro names execute a function by mapping the macro name to a function via this map (e.g., macros.set('external-macro-name', internalMacroFunction)). See ReadMe in this file for more context.
const macros = new Map<
    string,
    (...args: any[]) => Promise<ErrorData<PopulatedTemplate['result']>>
>()

async function runModelTemplates(
    model: Model
): Promise<ErrorData<PopulatedTemplate[]>> {
    try {
        if (!model.hasOwnProperty('templates')) {
            return [null, []]
        }

        const templates: Model['templates'] = cloneDeep(model.templates)

        const populatedTemplates = await Promise.all(
            templates.map(async (template: Template & { result: any }) => {
                const [macroName, macroArgument] = template.macro.split(/\s+/)
                const macroService = macros.get(macroName)

                assert(
                    macroService,
                    new createError.BadRequest(`Macro, ${macroName}, not supported.`)
                )

                const [error, filledTemplate] = await macroService(macroArgument)

                assert(
                    !error,
                    new createError.InternalServerError(
                        `Template macro ${macroName} did not run.`
                    )
                )

                template.result = filledTemplate

                return template
            })
        )

        return [null, populatedTemplates]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

async function listDependenciesByTitle(
    macroArgument: string
): Promise<ErrorData<PopulatedTemplate['result']>> {
    try {
        const [modelNameEncoded, dependentFieldEncoded, targetField] =
            macroArgument.split('.')
        const modelName = decodeURIComponent(modelNameEncoded)
        //* Remove brackets if this is an array field; used in DB query and final result.
        const dependentField = dependentFieldEncoded.replace(/\[\]$/, '')

        const documentRepository = new DocumentRepository(modelName)

        const results = await documentRepository.getDependenciesByTitle(
            dependentField
        )

        //* Turn the list of results into a JSON Schema dependencies tree.
        const dependencies = {
            [modelName]: {
                oneOf: results
                    //* Filter out invalid results.
                    .filter((result: any) => typeof result.title !== 'undefined')
                    .map((result: any) => ({
                        properties: {
                            [modelName]: {
                                enum: [result.title],
                            },
                            [targetField]: {
                                enum: result[dependentField],
                            },
                        },
                    })),
            },
        }

        return [null, dependencies]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

async function listUniqueFieldValues(
    macroArgument: string
): Promise<ErrorData<PopulatedTemplate['result']>> {
    try {
        //* macroArgument looks like "Keywords.title" or "Collection%20Metadata.Combined_EntryID".
        const [encodedModelName, fieldName] = macroArgument.split('.')
        //* Model names stored as macros appear to be URL-component encoded. If that changes in the future, there is no harm in decoding an already-decoded string.
        const modelName = decodeURIComponent(encodedModelName)

        const documentRepository = new DocumentRepository(modelName)

        //! The fieldName must always be the titleProperty (see macro ReadMe).
        const results = await documentRepository.getUniqueFieldValues(fieldName)

        return [null, results]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

async function getAllWebhookURLs(): Promise<ErrorData<string[]>> {
    try {
        // NOTE: Get only the webhook URLs to avoid exposing the bearer tokens to the frontend.
        const [error, webhooks] = getAllWebhookConfigs()

        if (error) {
            throw error
        }

        const webhookURLs = webhooks.map(webhook => webhook.URL)

        return [null, webhookURLs]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

//* The exported "runModelTemplate" below and these macro names (consumed programmatically in "runModelTemplate" are the exposed interface that mEditor template macros will use. See the ReadMe in this file for more context.
macros.set('list', listUniqueFieldValues)
macros.set('listDependenciesByTitle', listDependenciesByTitle)
macros.set('webhooks', getAllWebhookURLs)

export { getAllWebhookURLs, runModelTemplates }
