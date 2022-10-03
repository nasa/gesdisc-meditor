import { NextApiResponse } from 'next'
import { ZodError } from 'zod'
import { isJsonType } from './string'

export class HttpException extends Error {
    status

    constructor(status: number, message: string | ZodError) {
        if (message instanceof ZodError) {
            message = JSON.stringify(message.issues)
        }

        super(message)

        this.status = status
        Object.setPrototypeOf(this, HttpException.prototype)
    }

    toJson() {
        return {
            status: this.status,
            error: isJsonType(this.message) ? JSON.parse(this.message) : this.message,
        }
    }
}

export class BadRequestException extends HttpException {
    constructor(message: string | ZodError = 'Bad Request') {
        super(400, message)

        Object.setPrototypeOf(this, BadRequestException.prototype)
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string | ZodError = 'Bad Request') {
        super(404, message)

        Object.setPrototypeOf(this, NotFoundException.prototype)
    }
}

export class MethodNotAllowedException extends HttpException {
    constructor(message: string | ZodError = 'Method Not Allowed') {
        super(405, message)

        Object.setPrototypeOf(this, MethodNotAllowedException.prototype)
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string | ZodError = 'Unauthorized') {
        super(401, message)

        Object.setPrototypeOf(this, UnauthorizedException.prototype)
    }
}

/**
 * converts errors to a JSON api response
 */
export function apiError(response: NextApiResponse, error: Error | HttpException) {
    console.log(error, typeof error, error instanceof HttpException)

    if (error instanceof HttpException) {
        response.status(error.status).json(error.toJson())
    } else {
        response.status(400).json({
            status: 400,
            error: error.message || 'Bad Request',
        })
    }
}
