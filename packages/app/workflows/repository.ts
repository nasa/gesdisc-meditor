import { BaseRepository } from 'lib/database/base-repository'
import { Workflow } from './types'

export class WorkflowRepository extends BaseRepository<Workflow> {
    constructor() {
        super('Workflows', 'name')
    }

    async findByNames(workflowNames: string[]): Promise<Workflow[]> {
        return this.find(
            {
                $match: { [this.titleProperty]: { $in: workflowNames } },
            },
            {
                'x-meditor.modifiedOn': -1,
            }
        )
    }
}
