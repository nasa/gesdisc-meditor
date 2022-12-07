import cloneDeep from 'lodash.clonedeep'
import { getModel } from '../models/service'
import type { Model, PopulatedTemplate, Template } from '../models/types'
import { onlyUnique } from '../utils/array'
import { ErrorCode, HttpException } from '../utils/errors'
import { getMacrosDb } from './db'

/**
 * Macros are a DSL for running queries used to populate models.
 * given a model with a property of templates, will populate the templates section with results
 *
 * Example, given a model with the property:
 * {
 *     templates: [
 *         "jsonpath": "$.properties.news.items.enum",
 *         "macro": "list News.title"
 *     ]
 * }
 *
 * Will return:
 * [
 *     "jsonpath": "$.properties.news.items.enum",
 *     "macro": "list News.title",
 *     "result": [
 *         ...a list of all News document titles
 *     ]
 * ]
 */
async function runModelTemplates(model: Model) {
    if (!model.hasOwnProperty('templates')) {
        return []
    }

    const templates: Model['templates'] = cloneDeep(model.templates)

    const populatedTemplates = await Promise.all(
        templates.map(async (template: Template) => {
            const [macroName, macroArgument] = template.macro.split(/\s+/)
            const macroService = macros.get(macroName)

            if (!macroService) {
                throw new HttpException(
                    ErrorCode.BadRequest,
                    `Macro, ${macroName}, not supported.`
                )
            }

            ;(template as PopulatedTemplate).result = await macroService(
                macroArgument
            )

            return template as PopulatedTemplate
        })
    )

    return populatedTemplates
}

// todo: same ErrorData tuple?
async function listUniqueFieldValues(macroArgument: string) {
    const macrosDb = await getMacrosDb()
    //* macroArgument looks like "Keywords.title" or "Collection%20Metadata.Combined_EntryID".
    const [encodedModelName, fieldName] = macroArgument.split('.')
    //* Model names stored as macros appear to be URL-component encoded. If that changes in the future, there is no harm in decoding an already-decoded string.
    const modelName = decodeURIComponent(encodedModelName)
    //! If the unwritten contract for the "list" macro is that the fieldName will always be the titleProperty, this is a useless argument to pass into getUniqueFieldValues.
    //* We need the title property: get the model described in the macro's argument without running the macro.
    const [error, { titleProperty }] = await getModel(modelName)

    if (error) {
        throw new HttpException(ErrorCode.NotFound, `Model not found: ${modelName}.`)
    }

    //* Do not await the result of this operation, as this is being consumed in Promise.all().
    const results = macrosDb.getUniqueFieldValues(fieldName, modelName, titleProperty)

    return results
}

/**
 * generates a JSONSchema dependencies section https://json-schema.org/understanding-json-schema/reference/conditionals.html
 *
 * The macro (defined in a model's templates section) would look something like this
 *
 *      jsonPath: $.dependencies
 *      macro: listDependenciesByTitle DAAC.cmrProviders[].CmrProvider
 *
 * The above macro would get a list of all DAACs with their cmrProviders and build a dependency tree out of it.
 * Selecting a DAAC would populate the "CmrProvider" field enum with a list of only that DAAC's CMR Providers.
 */
async function listDependenciesByTitle(dbo, item) {
    const [model, dependentField, targetField] = item[0].split('.')
    const modelName = decodeURIComponent(model)
    const mongoField = dependentField.replace(/\[\]$/, '') // remove brackets for the mongo query if this is an array field

    if (!model.match(/^\S+$/)) {
        console.log(
            "Error: collection name in '" + item + "' should not have white spaces"
        )
        throw 'Error: collection name in ' + item + ' should not have white spaces'
    }

    const results = await dbo
        .collection(modelName)
        .aggregate([
            { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
            { $group: { _id: '$title', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
            { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
            {
                $project: {
                    _id: 0,
                    title: 1,
                    [mongoField]: 1,
                },
            },
        ])
        .toArray()

    // turn the list of results into a JSON Schema dependencies tree
    const dependencies = {
        [modelName]: {
            oneOf: results
                .filter(result => typeof result.title !== 'undefined') // filter out invalid results
                .map(result => ({
                    properties: {
                        [modelName]: {
                            enum: [result.title],
                        },
                        [targetField]: {
                            enum: result[mongoField],
                        },
                    },
                })),
        },
    }

    return dependencies
}

function userRoles(dbo) {
    var roleList = []
    return new Promise(function (resolve, reject) {
        dbo.collection('Models')
            .aggregate(
                [
                    {
                        $lookup: {
                            from: 'Workflows',
                            localField: 'workflow',
                            foreignField: 'name',
                            as: 'graph',
                        },
                    },
                    { $project: { _id: 0, name: 1, 'graph.roles': 1 } },
                    { $unwind: '$graph' },
                ],
                { allowDiskUse: true }
            )
            .toArray(function (err, res) {
                if (err) {
                    console.log(err)
                    throw err
                } else {
                    res.forEach(element => {
                        roleList.concat(element.graph.roles)
                    })
                    resolve(roleList.filter(onlyUnique))
                }
            })
    })
}

const macros = new Map<string, Function>()

macros.set('list', listUniqueFieldValues)

export { runModelTemplates }
