import type { ErrorData } from 'declarations'
import type { NextApiResponse } from 'next'
import type { ZodError, ZodSchema } from 'zod'
import { parameterWithInflection } from '../lib/grammar'

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

export type HttpExceptionStatus = 400 | 401 | 403 | 404 | 405 | 500

export class HttpException extends Error {
    cause: ErrorCause

    constructor(codeOrStatus: ErrorCode | number, message: string) {
        super(message)

        this.cause =
            typeof codeOrStatus === 'number'
                ? this.#mapStatusToCause(codeOrStatus)
                : this.mapCodeToCause(codeOrStatus)
    }

    private mapCodeToCause(code: ErrorCode): ErrorCause {
        let status: number

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

    #mapStatusToCause(maybeStatus: HttpExceptionStatus | number) {
        let code: ErrorCode
        let status: HttpExceptionStatus

        switch (maybeStatus) {
            case 400:
                code = ErrorCode.BadRequest
                status = maybeStatus
                break

            case 401:
                code = ErrorCode.Unauthorized
                status = maybeStatus
                break

            case 403:
                code = ErrorCode.ForbiddenError
                status = maybeStatus
                break

            case 404:
                code = ErrorCode.NotFound
                status = maybeStatus
                break

            case 405:
                code = ErrorCode.MethodNotAllowed
                status = maybeStatus
                break

            case 500:
                code = ErrorCode.InternalServerError
                status = maybeStatus
                break

            default:
                code = ErrorCode.InternalServerError
                status = 500
                break
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
export function apiError(
    error: Error | HttpException | ZodError,
    response: NextApiResponse
) {
    let interstitialError = error

    if (error.name === 'ZodError') {
        interstitialError = formatZodError(error as ZodError)
    }

    const safeError = interstitialError.cause
        ? (interstitialError as HttpException)
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

export function parseZodAsErrorData<T>(schema: ZodSchema, input: any): ErrorData<T> {
    try {
        const data = schema.parse(input)

        return [null, data]
    } catch (error) {
        return [error, null]
    }
}

export function formatZodError(error: ZodError, messagePrefix?: string) {
    const errorString = error.issues.reduce((accumulator, current, index, self) => {
        //* We want spaces between errors but not for the last error.
        const maybeSpace = index + 1 === self.length ? '' : ' '

        accumulator += `${
            messagePrefix ??
            `For query ${parameterWithInflection(
                current.path.length
            )} ${current.path.toString()}: `
        }${current.message}.${maybeSpace}`

        return accumulator
    }, ``)

    return Error(errorString, {
        cause: { status: 400 },
    })
}
