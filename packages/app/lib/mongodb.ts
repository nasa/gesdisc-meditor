/**
 * MongoClient following the Vercel pattern
 * https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
 */

import { getDatabaseRepository } from 'database/repository.factory'
import { Document, WithId } from 'mongodb'

// TODO: REMOVE THIS WHOLE FILE

const getDb = async (dbName?: string) => {
    const repository = await getDatabaseRepository()

    // @ts-expect-error
    return repository.db
}

// Next doesn't know how to process the Mongo _id property, as it's an object, not a string. So this hack parses ahead of time
// https://github.com/vercel/next.js/issues/11993
function makeSafeObjectIDs(
    records: Record<string, any> | Record<string, any>[] | WithId<Document> | null
) {
    return !!records ? JSON.parse(JSON.stringify(records)) : records
}

export { getDb as default, makeSafeObjectIDs }
