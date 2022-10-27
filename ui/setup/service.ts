import type { ErrorData } from '../declarations'
import { getModels } from '../models/model'
import { BadRequestException } from '../utils/errors'
import { getSetupDb } from './db'
import type { User } from './types'

async function setUpNewInstallation(users: User[] = []): Promise<ErrorData<null>> {
    console.log('Request to set up mEditor received. Adding users: ', users)

    try {
        const setupDb = await getSetupDb()
        // todo: refactor once getModels is a class instance of modelsDb
        const models = await getModels()

        if (!!models.length) {
            throw new BadRequestException(`mEditor's DB has already been seeded.`)
        }

        await setupDb.seedDb(users)

        return [null, null]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export { setUpNewInstallation }
