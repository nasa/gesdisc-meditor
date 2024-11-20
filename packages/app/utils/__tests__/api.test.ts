import { parseResponse } from '../api'

describe('parseResponse', () => {
    const responseMock = {
        headers: null,
        async json() {
            return { foo: 'bar' }
        },
        async text() {
            return 'foo is bar'
        },
    } as unknown as Response

    beforeAll(() => {
        // @ts-ignore
        responseMock.headers = new Map()
    })

    test('reads Content-Type header to determine parse type', async () => {
        responseMock.headers.set('content-type', 'text/plain; charset=utf-8')
        const resultText = await parseResponse(responseMock)
        expect(resultText).toEqual(await responseMock.text())

        responseMock.headers.set('content-type', 'application/json; charset=utf-8')
        const resultJSON = await parseResponse(responseMock)
        expect(resultJSON).toEqual(await responseMock.json())
    })

    test('defaults to text()', async () => {
        responseMock.headers.set(
            'content-type',
            'multipart/form-data; boundary=ExampleBoundaryString'
        )
        const resultText = await parseResponse(responseMock)
        expect(resultText).toEqual(await responseMock.text())
    })
})
