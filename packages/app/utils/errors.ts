import type { NextApiResponse } from 'next'

export enum ErrorCode {
    NotFound = 'NotFound',
    BadRequest = 'BadRequest',
    ValidationError = 'ValidationError',
    MethodNotAllowed = 'MethodNotAllowed',
    Unauthorized = 'Unauthorized',
    InternalServerError = 'InternalServerError',
    ForbiddenError = 'ForbiddenError',
}

export interface ErrorCause {
    status: number
    code: ErrorCode
}

export class HttpException extends Error {
    cause: ErrorCause

    constructor(code: ErrorCode, message: string) {
        super(message)

        this.cause = this.mapCodeToCause(code)
    }

    private mapCodeToCause(code: ErrorCode): ErrorCause {
        let status

        switch (code) {
            case ErrorCode.NotFound:
                status = 404
                break

            case ErrorCode.BadRequest:
            case ErrorCode.ValidationError:
                status = 400
                break

            case ErrorCode.MethodNotAllowed:
                status = 405
                break

            case ErrorCode.Unauthorized:
                status = 401
                break

            case ErrorCode.ForbiddenError:
                status = 403
                break

            case ErrorCode.InternalServerError:
                status = 500
                break

            default:
                status = 500 // unknown error
        }

        return {
            status,
            code,
        }
    }
}

/**
 * converts errors to a JSON api response
 * To prevent leaking implementation details to an end-user, if the error isn't an instance of HttpException, only return a generic error.
 */
export function apiError(error: Error | HttpException, response: NextApiResponse) {
    const safeError = error.cause
        ? (error as HttpException)
        : new HttpException(ErrorCode.InternalServerError, 'Internal Server Error')

    return response.status(safeError.cause.status).json({
        status: safeError.cause.status,
        error: safeError.message,
    })
}

/**
 * compare an unknown error to see if it matches an expected error code
 *
 * ex. errorMatchesErrorCode(myError, ErrorCode.NotFound)
 */
export function errorMatchesErrorCode(
    error: Error | HttpException | undefined,
    errorCode: ErrorCode
) {
    return error && error instanceof HttpException && error.cause.code === errorCode
}

/**
 * helper function as this is a fairly common use-case
 */
export function isNotFoundError(error?: Error | HttpException) {
    return errorMatchesErrorCode(error, ErrorCode.NotFound)
}
