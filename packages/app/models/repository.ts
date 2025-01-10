import { BaseRepository } from '../lib/database/base-repository'
import type { Model } from './types'

export class ModelRepository extends BaseRepository<Model> {
    constructor() {
        super('Models', 'name')
    }

    /**
     * TODO: LEGACY - in need of refactor or documentation
     */
    async getModelWithMaybePrevious(documentTitle: string): Promise<Model[]> {
        const pipeline = [
            { $match: { name: documentTitle } },
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            {
                $addFields: {
                    'x-meditor.state': {
                        $arrayElemAt: ['$x-meditor.states.target', -1],
                    },
                },
            },
            { $limit: 2 },
        ]

        return this.aggregate<Model>(pipeline)
    }
}
