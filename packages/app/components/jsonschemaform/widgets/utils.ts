import { ID_PREFIX } from './constants'

const macros = {
    FIELD_LOOKUP: (name: string) => {
        let el = document.getElementById(`${ID_PREFIX}${name}`) as HTMLInputElement
        // This may be run before the element has been rendered to the DOM, so don't return `undefined`.
        const value = el.value ?? ''

        return globalThis.encodeURIComponent(value)
    },
} as const

function findAndReplace(
    sourceString: string = '',
    every: string = '',
    to: string[] = [],
    macros: Record<string, Function> = {}
) {
    // Starting from the source string, iterate through every entry in "to", replacing with either a macro's return value or a value.
    return to.reduce((accumulator, current) => {
        // We may have a MACRO_NAME:FieldName combo, or we may have a value.
        const [macroNameOrValue, maybeFieldName] = current.split(':')
        const maybeMacro = macros[macroNameOrValue]

        if (maybeMacro) {
            // We know we have a macro now.
            const macroName = macroNameOrValue
            const fieldName = maybeFieldName

            switch (macroName) {
                case 'FIELD_LOOKUP':
                    const replacementValue = macros[macroName](fieldName)

                    return accumulator.replace(every, replacementValue)

                default:
                    throw Error(
                        `Handler does not yet have a case to handle this macro: ${macroName}`
                    )
            }
        } else {
            return accumulator.replace(every, current)
        }
    }, sourceString)
}

export { findAndReplace, macros }
