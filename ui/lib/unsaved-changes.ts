import Template from './template'

const KEY_PREFIX_TEMPLATE = `meditor.{modelName}.`

export function findUnsavedDocumentsByModel(modelName) {
    let values = []
    let keyPrefixQuery = new Template(KEY_PREFIX_TEMPLATE.replace(/\./g, '\.')).replace({
        modelName,
    })

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            if (key.match(keyPrefixQuery)) {
                values.push(JSON.parse(localStorage.getItem(key)))
            }
        }
    }

    return values
}
