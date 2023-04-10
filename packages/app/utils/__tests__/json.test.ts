import { safeParseJSON } from '../json'

test('returns tuple containing data on happy path', () => {
    const [error, data] = safeParseJSON('{ "passed": true }')

    expect(error).toBeNull()
    expect(data).toMatchInlineSnapshot(`
        Object {
          "passed": true,
        }
    `)
})

test('handles arrays and objects', () => {
    const [objectError, objectData] = safeParseJSON({ passed: true })
    const [arrayError, arrayData] = safeParseJSON([{ passed: true }])

    expect(objectError).toBeNull()
    expect(arrayError).toBeNull()
    expect(objectData).toMatchInlineSnapshot(`
        Object {
          "passed": true,
        }
    `)
    expect(arrayData).toMatchInlineSnapshot(`
        Array [
          Object {
            "passed": true,
          },
        ]
    `)
})

test('returns tuple containing error without throwing', () => {
    const [error, data] = safeParseJSON(`{ passed: true }`)

    expect(data).toBeNull()
    expect(error).toMatchInlineSnapshot(
        `[SyntaxError: Unexpected token p in JSON at position 2]`
    )
})

test('handles primitive data types just like JSON.parse', () => {
    const [stringError, string] = safeParseJSON('string')
    expect(stringError).toMatchInlineSnapshot(
        `[SyntaxError: Unexpected token s in JSON at position 0]`
    )
    expect(string).toBeNull()

    const [numberError, number] = safeParseJSON(42)
    expect(numberError).toBeNull()
    expect(number).toMatchInlineSnapshot(`42`)

    const [bigIntError, bigInt] = safeParseJSON(BigInt(42))
    expect(bigIntError).toBeNull()
    expect(bigInt).toMatchInlineSnapshot(`42`)

    const [booleanError, boolean] = safeParseJSON(true)
    expect(booleanError).toBeNull()
    expect(boolean).toMatchInlineSnapshot(`true`)

    const [undefinedError, undefinedVariable] = safeParseJSON(undefined)
    expect(undefinedError).toMatchInlineSnapshot(
        `[SyntaxError: Unexpected token u in JSON at position 0]`
    )
    expect(undefinedVariable).toBeNull()

    const [symbolError, symbol] = safeParseJSON(Symbol('unique'))
    expect(symbolError).toMatchInlineSnapshot(
        `[TypeError: Cannot convert a Symbol value to a string]`
    )
    expect(symbol).toBeNull()

    const [nullError, nullVariable] = safeParseJSON(null)
    expect(nullError).toBeNull()
    expect(nullVariable).toMatchInlineSnapshot(`null`)
})
