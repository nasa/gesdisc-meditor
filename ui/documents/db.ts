import { Db } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import {
    addStatesToDocument,
    latestVersionOfDocument,
} from '../models/shared.queries'
import type { Document, DocumentsSearchOptions } from '../models/types'
import { BadRequestException } from '../utils/errors'
import { convertLuceneQueryToMongo } from '../utils/search'
import { DocumentHistory } from './types'

class DocumentsDb {
    #DEFAULT_SORT = '-x-meditor.modifiedOn'
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

    async getDocumentsForModel(
        modelName: string,
        searchOptions: DocumentsSearchOptions,
        titleProperty: string
    ): Promise<Document[]> {
        console.log(modelName, searchOptions, titleProperty)
        // parse out what we'll sort on, or fall back to the default
        const sortProperty = (searchOptions?.sort || this.#DEFAULT_SORT).replace(
            /^-/,
            ''
        )

        const sortDir =
            (searchOptions?.sort || this.#DEFAULT_SORT).charAt(0) == '-' ? -1 : 1

        const pipeline = [
            // filter out deleted documents
            {
                $match: {
                    'x-meditor.deletedOn': { $exists: false },
                },
            },

            // since documents can be so large, only include a handful of needed fields
            // TODO: once pagination is added to the API, this shouldn't be needed anymore
            {
                $project: {
                    _id: 0,
                    title: `$${titleProperty}`, // add a title field that matches the `titleProperty` field
                    [titleProperty]: 1,
                    'x-meditor': 1,
                },
            },

            // make sure we only return the latest version of each document (collection holds document history)
            ...latestVersionOfDocument(titleProperty),

            // add states to the document
            ...addStatesToDocument(),

            // sort the result
            {
                $sort: {
                    [sortProperty]: sortDir,
                },
            },
        ]

        // if the user is searching the documents, we'll convert their query to the mongo equivalent
        if (searchOptions?.filter) {
            try {
                // add another match to query for the user's filter
                pipeline.push({
                    $match: convertLuceneQueryToMongo(searchOptions.filter),
                })
            } catch (err) {
                throw new BadRequestException('Improperly formatted filter')
            }
        }

        let documents = await this.#db
            .collection(modelName)
            .aggregate(pipeline, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(documents)
    }
}

const db = new DocumentsDb()

async function getDocumentsDb() {
    await db.connect(getDb)

    return db
}

export { getDocumentsDb }
