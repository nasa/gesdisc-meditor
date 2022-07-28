import { MacroTemplate, Model } from '../models/types'
import clonedeep from 'lodash.clonedeep'
import { filterUndefined, filterUnique } from '../utils/array'
import { BadRequestException } from '../utils/errors'
import getDb from '../lib/mongodb'

export const macroFunctions = {
    /**
     * a macro function for listing field values
     * the model/field is given in the pattern ["Model.field"]
     *
     * example: ["News.title"] would return a list of unique titles in the News model
     */
    list: async function (macroValue: string[]) {
        const db = await getDb()
        const [modelName, field] = macroValue[0].split('.')
        const fieldName = decodeURIComponent(field)

        if (!modelName.match(/^\S+$/)) {
            throw new BadRequestException(
                `Error: collection name in "${macroValue[0]}" should not have white spaces`
            )
        }

        const documents = await db
            .collection(decodeURIComponent(modelName))
            .find({}) // grab all documents in this collection
            .project({ _id: 0, [`${fieldName}`]: 1 }) // only retrieve the field we're looking for
            .toArray()

        return documents
            .map(document => document[fieldName])
            .filter(filterUndefined)
            .filter(filterUnique)
    },
}

/**
 * given a list of macro templates, will return the macro templates populated with results
 *
 * example, given this list of templates:
 * [
 *     "jsonpath": "$.properties.news.items.enum",
 *     "macro": "list News.title"
 * ]
 *
 * Will return the template populating with all news document titles:
 *
 * [
 *     "jsonpath": "$.properties.news.items.enum",
 *     "macro": "list News.title",
 *     "result": [
 *         ...a list of all News document titles
 *     ]
 * ]
 */
export async function populateMacroTemplates(model: Model): Promise<MacroTemplate[]> {
    if (!model?.templates?.length) {
        return []
    }

    const templates = clonedeep(model.templates)

    return await Promise.all(
        templates.map(async template => {
            const macroFields = template.macro.split(/\s+/)
            const macroName = macroFields[0]
            const macroValue = macroFields.slice(1, macroFields.length)

            if (!macroFunctions.hasOwnProperty(macroName)) {
                throw new BadRequestException(`Macro, ${macroName}, not supported`)
            }

            template.result = await macroFunctions[macroName](macroValue)

            return template
        })
    )
}
