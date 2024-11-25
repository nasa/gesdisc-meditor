import type { ErrorData } from 'declarations'
import type { NextApiResponse } from 'next'
import type { ZodError, ZodSchema } from 'zod'
import { parameterWithInflection } from '../lib/grammar'

export enum ErrorStatusText {
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
    code: ErrorStatusText
}

export type ErrorStatusCode = 400 | 401 | 403 | 404 | 405 | 500

export class HttpException extends Error {
    cause: ErrorCause

    constructor(codeOrStatus: ErrorStatusText | number, message: string) {
        super(message)

        this.cause =
            typeof codeOrStatus === 'number'
                ? this.#mapStatusToCause(codeOrStatus)
                : this.mapCodeToCause(codeOrStatus)
    }

    private mapCodeToCause(code: ErrorStatusText): ErrorCause {
        let status: ErrorStatusCode

        switch (code) {
            case ErrorStatusText.NotFound:
                status = 404
                break

            case ErrorStatusText.BadRequest:
            case ErrorStatusText.ValidationError:
                status = 400
                break

            case ErrorStatusText.MethodNotAllowed:
                status = 405
                break

            case ErrorStatusText.Unauthorized:
                status = 401
                break

            case ErrorStatusText.ForbiddenError:
                status = 403
                break

            case ErrorStatusText.InternalServerError:
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

    #mapStatusToCause(maybeStatus: ErrorStatusCode | number) {
        let code: ErrorStatusText
        let status: ErrorStatusCode

        switch (maybeStatus) {
            case 400:
                code = ErrorStatusText.BadRequest
                status = maybeStatus
                break

            case 401:
                code = ErrorStatusText.Unauthorized
                status = maybeStatus
                break

            case 403:
                code = ErrorStatusText.ForbiddenError
                status = maybeStatus
                break

            case 404:
                code = ErrorStatusText.NotFound
                status = maybeStatus
                break

            case 405:
                code = ErrorStatusText.MethodNotAllowed
                status = maybeStatus
                break

            case 500:
                code = ErrorStatusText.InternalServerError
                status = maybeStatus
                break

            default:
                code = ErrorStatusText.InternalServerError
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
        : new HttpException(
              ErrorStatusText.InternalServerError,
              'Internal Server Error'
          )

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
    errorCode: ErrorStatusText
) {
    return error && error instanceof HttpException && error.cause.code === errorCode
}

/**
 * helper function as this is a fairly common use-case
 */
export function isNotFoundError(error?: Error | HttpException) {
    return errorMatchesErrorCode(error, ErrorStatusText.NotFound)
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
