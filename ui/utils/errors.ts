import { NextApiResponse } from 'next'

export class HttpException extends Error {
    status

    constructor(status: number, message: string) {
        super(message)

        this.status = status
        Object.setPrototypeOf(this, HttpException.prototype)
    }

    toJson() {
        return {
            status: this.status,
            error: this.message,
        }
    }
}

export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad Request') {
        super(400, message)

        Object.setPrototypeOf(this, BadRequestException.prototype)
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string = 'Bad Request') {
        super(404, message)

        Object.setPrototypeOf(this, NotFoundException.prototype)
    }
}

/**
 * converts errors to a JSON api response
 */
export function apiError(response: NextApiResponse, error: Error | HttpException) {
    if (error instanceof HttpException) {
        response.status(error.status).json(error.toJson())
    } else {
        response.status(400).json({
            status: 400,
            error: error.message || 'Bad Request',
        })
    }
}
