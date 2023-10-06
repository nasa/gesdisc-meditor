import type { User, UserRole } from 'auth/types'
import { getLoggedInUser } from 'auth/service'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Model, ModelCategory } from 'models/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getDashboardDb } from './db'
import { getDocumentsForModel } from 'documents/service'

const collator = new Intl.Collator()

async function getRecentDocumentsFromModels(modelNames: string[]) {
    const documentPromises = []
    const recentDocuments = []

    for (const name of modelNames) {
        documentPromises.push(getDocumentsForModel(name))
    }

    const results = await Promise.allSettled(documentPromises)

    for (const result of results) {
        if (result.status === 'fulfilled') {
            const [_error, documents] = result.value

            // TODO implement pagination (in the getDocumentsForModel service) and use here
            recentDocuments.push(...documents.slice(0, 100))
        }
    }

    return recentDocuments.sort((a, b) =>
        a['x-meditor'].modifiedOn < b['x-meditor'].modifiedOn
            ? 1
            : a['x-meditor'].modifiedOn > b['x-meditor'].modifiedOn
            ? -1
            : 0
    )
}

async function getModelsAccessibleByUser(
    request: NextApiRequest | IncomingMessage,
    response: NextApiResponse | ServerResponse
) {
    const user = await getLoggedInUser(request, response)
    const uniqueModels = getUniqueModelsFromUserRoles(user.roles)

    return uniqueModels
}

function convertModelToDisplayModel(
    categories: string[],
    models: Model[],
    user: User | undefined
) {
    const modelCategories = []
    const modelsByCategory = new Map<ModelCategory['name'], ModelCategory['models']>()

    categories?.forEach(category => modelsByCategory.set(category, []))

    //* Removes unused data from models; puts user's roles on each model.
    models?.forEach(({ category, ['x-meditor']: meta, icon, name }) => {
        modelsByCategory.get(category).push({
            category,
            count: meta?.count,
            icon,
            name,
            userRoles: user
                ? user.roles.reduce((accumulator, current) => {
                      if (current.model === name) {
                          accumulator.push(current.role)
                      }

                      return accumulator
                  }, [])
                : [],
        })
    })

    for (const [category, models] of modelsByCategory) {
        modelCategories.push({
            name: category,
            models: models.sort((a, b) => collator.compare(a.name, b.name)),
            userHasRoles: models.some(model => model.userRoles.length > 0),
        })
    }

    return modelCategories
}

function getUniqueModelsFromUserRoles(listOfRoles: UserRole[] = []) {
    const uniqueModelCategories = new Set()

    for (const role of listOfRoles) {
        uniqueModelCategories.add(role.model)
    }

    return Array.from(uniqueModelCategories).sort(collator.compare) as string[]
}

function getUniqueModelCategories(listOfModels: Model[] = []) {
    const uniqueModelCategories = new Set()

    for (const model of listOfModels) {
        uniqueModelCategories.add(model.category)
    }

    return Array.from(uniqueModelCategories).sort(collator.compare) as string[]
}

export {
    convertModelToDisplayModel,
    getModelsAccessibleByUser,
    getRecentDocumentsFromModels,
    getUniqueModelCategories,
}
