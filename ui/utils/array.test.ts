import { filterUnique, filterUndefined } from './array'

describe('filterUnique', () => {
    interface testArrayToExpected {
        testArray: string[]
        expected: string[]
    }

    test.each`
        testArray                              | expected
        ${['foo', 'bar', 'foo', 'foo', 'bar']} | ${['foo', 'bar']}
        ${['foo', 'bar']}                      | ${['foo', 'bar']}
        ${[]}                                  | ${[]}
    `(
        'should return `$expected` for `$testArray`',
        ({ testArray, expected }: testArrayToExpected) => {
            expect(testArray.filter(filterUnique)).toEqual(expected)
        }
    )
})

describe('filterUndefined', () => {
    interface testArrayToExpected {
        testArray: string[]
        expected: string[]
    }

    test.each`
        testArray                    | expected
        ${['foo', 'bar', undefined]} | ${['foo', 'bar']}
        ${['foo', 'bar']}            | ${['foo', 'bar']}
        ${[]}                        | ${[]}
    `(
        'should return `$expected` for `$testArray`',
        ({ testArray, expected }: testArrayToExpected) => {
            expect(testArray.filter(filterUndefined)).toEqual(expected)
        }
    )
})
