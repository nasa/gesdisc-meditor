import { findAndReplace } from '../utils'

/**
    "href": "http://localhost:8080/service-request-from-config?variable_entry_id=******",
    "text": "",
    "change": {
        "every": "***",
        "to": ["FIELD_LOOKUP:EntryID", "FIELD_LOOKUP:VariableEntryID"] // replace with no regex, not replaceAll, is used. This means you can stack "every" to replace per "to" field.
    } 
  */
describe(`RJSF Widgets`, () => {
    describe(`findAndReplace`, () => {
        const sourceString =
            'http://localhost:8080/service-request-from-config?variable_entry_id=***'
        const every = '***'
        const to = ['a-variable-entry-id']
        const macros = {
            FIELD_LOOKUP: () => 'this value was returned',
        } as const

        test(`replaces a single instance with a single value, no macro`, () => {
            const value = findAndReplace(sourceString, every, to, macros)

            expect(value).toMatchInlineSnapshot(
                `"http://localhost:8080/service-request-from-config?variable_entry_id=a-variable-entry-id"`
            )
        })

        test(`can repeat multiple replacement for multiple matches`, () => {
            const sourceString =
                'http://localhost:***/service-request-from-config?variable_entry_id=******'
            const to = ['8080', 'foo', 'bar']
            const value = findAndReplace(sourceString, every, to, macros)

            expect(value).toMatchInlineSnapshot(
                `"http://localhost:8080/service-request-from-config?variable_entry_id=foobar"`
            )
        })

        test(`can use macros`, () => {
            // Our FIELD_LOOKUP macro does nothing but return a string, unlike the real macro.
            const to = ['FIELD_LOOKUP']
            const value = findAndReplace(sourceString, every, to, macros)

            expect(value).toMatchInlineSnapshot(
                `"http://localhost:8080/service-request-from-config?variable_entry_id=this value was returned"`
            )
        })

        test(`will throw if macro does not have a handler`, () => {
            const to = ['NOT_A_HANDLED_MACRO']
            const macros = {
                NOT_A_HANDLED_MACRO: () => `this doesn't have a handler`,
            } as const

            expect(() => {
                findAndReplace(sourceString, every, to, macros)
            }).toThrowErrorMatchingInlineSnapshot(
                `"Handler does not yet have a case to handle this macro: NOT_A_HANDLED_MACRO"`
            )
        })

        test(`will match per "to" entry found, but no further`, () => {
            const value = findAndReplace(sourceString, every, to, macros)

            expect(value).toMatchInlineSnapshot(
                `"http://localhost:8080/service-request-from-config?variable_entry_id=a-variable-entry-id"`
            )
        })

        test(`will not replace on empty "to" arrays`, () => {
            const to = []
            const value = findAndReplace(sourceString, every, to, macros)

            expect(value).toMatchInlineSnapshot(
                `"http://localhost:8080/service-request-from-config?variable_entry_id=***"`
            )
        })

        test(`will not replace on empty "every" string`, () => {
            const every = ''
            const value = findAndReplace(sourceString, every, to, macros)

            expect(value).toMatchInlineSnapshot(
                `"a-variable-entry-idhttp://localhost:8080/service-request-from-config?variable_entry_id=***"`
            )
        })

        test(`returns unmodified source string when no matches are found`, () => {
            const sourceString =
                'http://localhost:8080/service-request-from-config?variable_entry_id=^^^'
            const value = findAndReplace(sourceString, every, to, macros)

            expect(value).toEqual(sourceString)
        })
    })
})
