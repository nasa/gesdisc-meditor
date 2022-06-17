import { Model } from '../models/types'

export function sortModels(modelA: Model, modelB: Model) {
    if (modelA.category < modelB.category) return 1
    if (modelA.category > modelB.category) return -1

    return 0
}
