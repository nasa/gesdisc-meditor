import { v4 as uuid } from 'uuid'
import Template from './template'

export const UNTITLED_DOCUMENT_TITLE = 'Untitled Document'
export const KEY_TEMPLATE = `meditor.{modelName}.{localId}`

export interface UnsavedDocument {
    localId: string
    title: string
    model: string
    modifiedOn: number
    modifiedBy: string
    formData: any
}

function getLocalStorageKey(modelName, localId) {
    return new Template(KEY_TEMPLATE).replace({
        modelName,
        localId,
    })
}

export function getNewUnsavedDocument(modelName, uid): UnsavedDocument {
    return {
        localId: uuid(),
        title: UNTITLED_DOCUMENT_TITLE,
        model: modelName,
        modifiedOn: Date.now(),
        modifiedBy: uid,
        formData: {},
    }
}

export function retrieveUnsavedDocumentFromLS(modelName: string, localId: string): UnsavedDocument {
    return JSON.parse(localStorage.getItem(getLocalStorageKey(modelName, localId)))
}

export function updateUnsavedDocumentInLS(document: UnsavedDocument) {
    if (!document.formData || Object.entries(document.formData).length === 0) {
        // there's no form data, remove the item
        removeUnsavedDocumentFromLS(document)
        return
    }
    
    localStorage.setItem(getLocalStorageKey(document.model, document.localId), JSON.stringify(document))
}

export function removeUnsavedDocumentFromLS(document: UnsavedDocument) {
    localStorage.removeItem(getLocalStorageKey(document.model, document.localId))
}

export function findUnsavedDocumentsByModel(modelName): Array<UnsavedDocument> {
    let values = []
    let keyPrefix = KEY_TEMPLATE.replace('.{localId}', '').replace(/\./g, '.')
    let keyPrefixQuery = new Template(keyPrefix).replace({
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
