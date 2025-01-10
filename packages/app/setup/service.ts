import createError from 'http-errors'
import exampleNews from './db-seed/example-news.json'
import log from '../lib/log'
import models from './db-seed/models.json'
import workflows from './db-seed/workflows.json'
import { DocumentRepository } from '../documents/repository'
import { getModels } from '../models/service'
import { ModelRepository } from '../models/repository'
import { UserRepository } from '../auth/repository'
import { WorkflowRepository } from '../workflows/repository'
import type { ErrorData } from '../declarations'
import type { UserDuringSetup } from './types'

const EXAMPLE_NEWS_COLLECTION = 'Example News'

async function setUpNewInstallation(
    users: UserDuringSetup[] = []
): Promise<ErrorData<null>> {
    log.debug('Request to set up mEditor received. Adding users: ', users)

    try {
        const [modelsError, allModels] = await getModels()

        if (modelsError) {
            throw modelsError
        }

        if (!!allModels.length) {
            throw new createError.BadRequest(`mEditor's DB has already been seeded.`)
        }

        const ISO_DATE = new Date().toISOString()

        const usersWithMetadata = users.map(user => ({
            id: user.uid,
            name: user.name,
            roles: getDefaultRoles(),
            'x-meditor': {
                model: 'Users',
                modifiedOn: ISO_DATE,
                modifiedBy: 'system',
                states: [
                    {
                        source: 'Init',
                        target: 'Draft',
                        modifiedOn: ISO_DATE,
                    },
                ],
            },
        }))

        await new UserRepository().insertMany(usersWithMetadata)
        await new ModelRepository().insertMany(models as unknown[])
        await new WorkflowRepository().insertMany(workflows as unknown[])
        await new DocumentRepository(EXAMPLE_NEWS_COLLECTION).insertMany(
            exampleNews as unknown[]
        )

        return [null, null]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

/**
 * returns a list of default roles to set on the seeded users
 */
function getDefaultRoles() {
    return ['Models', 'Workflows', 'Users', 'Example News'].map(model => ({
        model,
        role: 'Author',
    }))
}

export { setUpNewInstallation }
