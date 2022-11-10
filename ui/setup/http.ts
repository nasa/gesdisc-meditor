import type { APIError, ErrorData } from '../declarations'
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
            const apiError: APIError = await response.json()

            return [apiError, null]
        }

        return [null, null]
    } catch (error) {
        return [error, null]
    }
}

export { fetchSeedDb }
