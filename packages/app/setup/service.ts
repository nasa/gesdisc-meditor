import type { ErrorData } from '../declarations'
import log from '../lib/log'
import { getModels } from '../models/service'
import { ErrorStatusText, HttpException } from '../utils/errors'
import { getSetupDb } from './db'
import type { UserDuringSetup } from './types'

async function setUpNewInstallation(
    users: UserDuringSetup[] = []
): Promise<ErrorData<null>> {
    log.debug('Request to set up mEditor received. Adding users: ', users)

    try {
        const setupDb = await getSetupDb()
        const [modelsError, models] = await getModels()

        if (modelsError) {
            throw modelsError
        }

        if (!!models.length) {
            throw new HttpException(
                ErrorStatusText.BadRequest,
                `mEditor's DB has already been seeded.`
            )
        }

        await setupDb.seedDb(users)

        return [null, null]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

export { setUpNewInstallation }
