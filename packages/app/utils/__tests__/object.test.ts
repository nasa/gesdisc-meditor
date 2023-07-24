import { clearEmpties } from '../object'

describe('clearEmpties', () => {
    test('modifies related documents when a Model is edited', async () => {
        const testObject = {
            foo: 'baz',
            bacon: [
                'eggs',
                undefined,
                'waffles',
                'pancakes',
                undefined,
                null,
                'blueberries',
            ],
            eggs: [undefined, null],
            haschildren: {
                foo: 'bar',
                emptyArr: [],
                arrayWithEmpties: [
                    {
                        undefinedThing: undefined,
                        foo: 'bar',
                    },
                    {
                        thing: undefined,
                    },
                    {},
                ],
                emptySubObject: {},
                subObject: {
                    undefinedThing: undefined,
                    nullThing: null,
                    anotherThing: 'bar',
                },
            },
        }

        expect(clearEmpties(testObject)).toEqual({
            foo: 'bar',
            bacon: ['eggs', 'waffles', 'pancakes', 'blueberries'],
            haschildren: {
                foo: 'bar',
                arrayWithEmpties: [
                    {
                        foo: 'bar',
                    },
                ],
                subObject: {
                    anotherThing: 'bar',
                },
            },
        })
    })
})
