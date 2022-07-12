import { isJsonType } from './string'

describe('isJsonType', () => {
    interface IsJsonParams {
        description: string
        testValue: any
        isTestValueJson: boolean
    }

    test.each`
        description                    | testValue                         | isTestValueJson
        ${'a string'}                  | ${'foo'}                          | ${false}
        ${'a JSON stringified string'} | ${JSON.stringify('foo')}          | ${false}
        ${'null value'}                | ${null}                           | ${false}
        ${'undefined value'}           | ${undefined}                      | ${false}
        ${'an object'}                 | ${{ key: 'foo' }}                 | ${true}
        ${'a JSON stringified object'} | ${JSON.stringify({ key: 'foo' })} | ${true}
        ${'an array'}                  | ${['foo']}                        | ${true}
        ${'a JSON stringified array'}  | ${JSON.stringify([])}             | ${true}
    `(
        'should return `$isTestValueJson` for $description',
        ({ testValue, isTestValueJson }: IsJsonParams) => {
            expect(isJsonType(testValue)).toEqual(isTestValueJson)
        }
    )
})
