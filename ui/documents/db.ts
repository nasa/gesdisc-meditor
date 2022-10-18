import { Db } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import { DocumentHistory } from './types'

class DocumentsDb {
    #db: Db

    // todo: use private class method after Next upgrade
    // #formatHistoryItem(item: any): DocumentHistory {
    private formatHistoryItem(item: any): DocumentHistory {
        const [last = {}] = item['x-meditor'].states.slice(-1)

        return {
            modifiedOn: item['x-meditor'].modifiedOn,
            modifiedBy: item['x-meditor'].modifiedBy,
            state: last.target,
            states: item['x-meditor'].states.filter(
                (state: { [key: string]: string }) => state.source !== 'Init'
            ),
        }
    }

    async connect(connectDb: () => Promise<Db>) {
        if (!this.#db) {
            this.#db = await connectDb()
        }
    }

    async getDocumentHistory(
        documentTitle: string,
        modelName: string,
        titleProperty: string
    ): Promise<DocumentHistory[]> {
        const pipeline = [
            {
                $match: {
                    [titleProperty]: documentTitle,
                    'x-meditor.deletedOn': { $exists: false },
                },
            },
            { $sort: { 'x-meditor.modifiedOn': -1 } },
        ]

        const historyItems = await this.#db
            .collection(modelName)
            .aggregate(pipeline)
            .map(this.formatHistoryItem)
            .toArray()

        return makeSafeObjectIDs(historyItems)
    }

    async getDocumentHistoryByVersion(
        documentTitle: string,
        modelName: string,
        titleProperty: string,
        versionId: string
    ): Promise<DocumentHistory> {
        const pipeline = [
            {
                $match: {
                    [titleProperty]: documentTitle,
                    'x-meditor.modifiedOn': versionId,
                    'x-meditor.deletedOn': { $exists: false },
                },
            },
        ]

        const [historyItem = {}] = await this.#db
            .collection(modelName)
            .aggregate(pipeline)
            .map(this.formatHistoryItem)
            .toArray()

        return makeSafeObjectIDs(historyItem)
    }
}

const db = new DocumentsDb()

async function getDocumentsDb() {
    await db.connect(getDb)

    return db
}

export { getDocumentsDb }
