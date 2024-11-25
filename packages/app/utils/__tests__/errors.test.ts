import { ErrorStatusText, HttpException } from '../errors'

describe('HttpExcpetion', () => {
    const message = "...that thing you tried to do? It didn't work out."
    const code = ErrorStatusText.BadRequest
    const status = 400

    test('accepts error code and message', () => {
        const error = new HttpException(code, message)

        expect(error.message).toEqual(message)
        expect(error.cause.code).toBe(code)
        expect(error.cause.status).toEqual(status)
    })

    test('accepts status and message', () => {
        const error = new HttpException(status, message)

        expect(error.message).toEqual(message)
        expect(error.cause.code).toBe(code)
        expect(error.cause.status).toEqual(status)
    })
})
