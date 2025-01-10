import { BaseRepository } from 'lib/database/base-repository'
import { Workflow } from './types'

export class WorkflowRepository extends BaseRepository<Workflow> {
    constructor() {
        super('Workflows', 'name')
    }
}
