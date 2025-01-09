import { BaseRepository } from 'lib/database/base-repository'
import type { Model } from './types'

export class ModelRepository extends BaseRepository<Model> {
    constructor() {
        super('Models', 'name')
    }
}
