import type { APIError, ErrorData } from '../declarations'
import { ErrorCode, HttpException } from '../utils/errors'
import type { User } from './types'

export async function getMe(): Promise<ErrorData<User>> {
    try {
        const response = await fetch('/meditor/api/me')

        if (!response.ok) {
            const { error }: APIError = await response.json()

            throw new HttpException(ErrorCode.BadRequest, error) // TODO: figure out proper error code using the status
        }

        const user = await response.json()

        return [null, user]
    } catch (error) {
        return [error, null]
    }
}
