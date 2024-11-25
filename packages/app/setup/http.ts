import type { APIError, ErrorData } from '../declarations'
import { ErrorStatusText, HttpException } from '../utils/errors'
import type { UserDuringSetup } from './types'

async function fetchSeedDb(users: UserDuringSetup[]): Promise<ErrorData<null>> {
    try {
        const response = await fetch(`/meditor/api/admin/seed-db`, {
            body: JSON.stringify(users),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })

        if (!response.ok) {
            const { status, error }: APIError = await response.json()

            throw new HttpException(ErrorStatusText.BadRequest, error) // TODO: figure out proper error code using the status
        }

        return [null, null]
    } catch (error) {
        return [error, null]
    }
}

export { fetchSeedDb }
