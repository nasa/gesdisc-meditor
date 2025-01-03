import createError from 'http-errors'
import log from './log'
import { NextApiRequest, NextApiResponse } from 'next'
import { parameterWithInflection } from './grammar'
import { ZodError } from 'zod'

export function withApiErrorHandler(handler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            // Call the original handler
            await handler(req, res)
        } catch (err) {
            console.error(err)
            // Any unhandled exceptions will be caught and reported as a clean JSON response
            return apiError(err, res)
        }
    }
}

/**
 * converts errors to a JSON api response
 * To prevent leaking implementation details to an end-user, if the error isn't an instance of HttpError, only return a generic error.
 */
export function apiError(
    error: Error | ZodError | createError.HttpError,
    response: NextApiResponse
) {
    let interstitialError = error

    if (error.name === 'ZodError') {
        interstitialError = formatZodError(error as ZodError)
    }

    const safeError =
        interstitialError instanceof createError.HttpError
            ? interstitialError
            : new createError.InternalServerError()

    if (safeError instanceof createError.InternalServerError) {
        // this is an unknown error, lets dump out the details so we can debug it later
        log.error(safeError)
    }

    return response.status(safeError.status).json({
        status: safeError.status,
        error: safeError.message,
    })
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

    return new createError.BadRequest(errorString)
}
