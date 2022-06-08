import { BadRequestException } from '../utils/errors'
import type { Document } from './types'

export async function getDocumentsForModel(modelName: string): Promise<Document[]> {
    if (!modelName) {
        throw new BadRequestException('Model name is required')
    }

    return []
}
