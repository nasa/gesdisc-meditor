import type { ErrorData } from '../declarations'
import { getModels } from '../models/service'
import { ErrorCode, HttpException } from '../utils/errors'
import { getSetupDb } from './db'
import type { UserDuringSetup } from './types'

async function setUpNewInstallation(
    users: UserDuringSetup[] = []
): Promise<ErrorData<null>> {
    console.log('Request to set up mEditor received. Adding users: ', users)

    try {
        const setupDb = await getSetupDb()
        const [modelsError, models] = await getModels()

        if (modelsError) {
            throw modelsError
        }

        if (!!models.length) {
            throw new HttpException(
                ErrorCode.BadRequest,
                `mEditor's DB has already been seeded.`
            )
        }

        await setupDb.seedDb(users)

        return [null, null]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export { setUpNewInstallation }
