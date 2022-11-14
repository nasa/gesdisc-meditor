import type { NextApiResponse } from 'next'

export class HttpException extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)

        this.status = status
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
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string = 'Not Found') {
        super(404, message)
    }
}

export class MethodNotAllowedException extends HttpException {
    constructor(message: string = 'Method Not Allowed') {
        super(405, message)
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string = 'Unauthorized') {
        super(401, message)
    }
}

export class InternalServerErrorException extends HttpException {
    constructor(message: string = 'Internal Server Error') {
        super(500, message)
    }
}

/**
 * converts errors to a JSON api response
 * To prevent leaking implementation details to an end-user, if the error isn't an instance of HttpException, only return a generic error.
 */
export function apiError(response: NextApiResponse, error: Error | HttpException) {
    if (error instanceof HttpException) {
        response.status(error.status).json(error.toJson())
    } else {
        console.error(error)

        response.status(500).json({
            status: 500,
            error: 'Internal Server Error',
        })
    }
}
