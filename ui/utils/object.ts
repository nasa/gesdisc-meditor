/**
 * recursively removes from an object:
 *      - empty objects
 *      - null/undefined values
 * https://stackoverflow.com/questions/42736031/remove-empty-objects-from-an-object
 */
export function clearEmpties(o: any) {
    for (var k in o) {
        if (typeof o[k] == 'undefined' || o[k] == null) {
            delete o[k] // clear undefined or null values
        }

        if (typeof o[k] !== 'object') {
            continue // if not an object, skip to the next iteration
        }

        // The property is an object
        clearEmpties(o[k]) // <-- Make a recursive call on the nested object
        if (Object.keys(o[k]).length === 0) {
            delete o[k] // The object had no properties, so delete that property
        }
    }
    return o
}
