/**
 * determines if the item passed in is something that can be JSON stringified or is already JSON stringified
 */
 export function isJsonType(item: any) {
    const itemToTest = typeof item !== 'string' ? JSON.stringify(item) : item
    let jsonObj

    try {
        jsonObj = JSON.parse(itemToTest)
    } catch (e) {
        return false
    }

    if (typeof jsonObj === 'object' && jsonObj !== null) {
        return true
    }

    return false
}
