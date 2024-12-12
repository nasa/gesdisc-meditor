import createError from 'http-errors'
import { convertLuceneQueryToMongo } from '../utils/search'
import { getDb } from '../lib/connections'
import { getDocumentInputSchema } from './schema'
import { makeSafeObjectIDs } from '../lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Db } from 'mongodb'
import type { UserWithRoles } from '../auth/types'
import type {
    DocumentsSearchOptions,
    Model,
    ModelWithWorkflow,
} from '../models/types'
import type { WorkflowEdge } from '../workflows/types'
import type {
    Document,
    DocumentHistory,
    DocumentPublications,
    DocumentState,
} from './types'

class DocumentsDb {
    #UNSPECIFIED_STATE_NAME = 'Unspecified'
    #UNKNOWN_USER = 'Unknown'
    #DEFAULT_SORT = '-x-meditor.modifiedOn'
    #DISALLOWED_SELF_TRANSITIONS = ['Under Review', 'Approved']
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

    /**
     * a lightweight check if a document exists, filtering out "deleted" documents
     */
    async documentExists(
        documentTitle: string,
        modelName: string,
        titleProperty: string
    ) {
        const document = await this.#db.collection(modelName).findOne({
            [titleProperty]: documentTitle,
            'x-meditor.deletedOn': { $exists: false },
        })

        return !!document
    }

    async getDocument(
        documentTitle: string,
        documentVersion: string,
        modelName: string,
        sourceToTargetStateMap: {
            [key: WorkflowEdge['source']]: WorkflowEdge['target'][]
        },
        titleProperty: string,
        uid?: UserWithRoles['uid']
    ) {
        // Parse input to make sure DB calls are with expected inputs.
        const parsedInput = getDocumentInputSchema.parse({
            documentTitle,
            documentVersion,
            modelName,
            sourceToTargetStateMap,
            titleProperty,
            uid,
        })

        const pipeline = [
            // If given a document version, match by that, too.
            !!parsedInput.documentVersion
                ? {
                      $match: {
                          [parsedInput.titleProperty]: parsedInput.documentTitle,
                          'x-meditor.deletedOn': { $exists: false },
                          'x-meditor.modifiedOn': parsedInput.documentVersion,
                      },
                  }
                : {
                      $match: {
                          [parsedInput.titleProperty]: parsedInput.documentTitle,
                          'x-meditor.deletedOn': { $exists: false },
                      },
                  },
            // Sort descending by version (date).
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            // Grab all fields in the most recent version.
            {
                $group: {
                    _id: `$${parsedInput.titleProperty}`,
                    doc: { $first: '$$ROOT' },
                },
            },
            // Put all fields of the most recent doc back into root of the document.
            { $replaceRoot: { newRoot: '$doc' } },
            // Each $addFields stage can add multiple fields, but if the values of one field are dependent on the values of another field, the second dependency needs to be separated into another $addFields stage.
            {
                $addFields: {
                    // Fall back to a default state if the document has no state records.
                    'x-meditor.states': {
                        $ifNull: [
                            '$x-meditor.states',
                            [
                                {
                                    target: 'Unspecified',
                                    source: 'Unspecified',
                                    modifiedBy: 'Unknown',
                                    modifiedOn: new Date().toISOString(),
                                },
                            ],
                        ],
                    },
                    // Add the model's title property and model name
                    'x-meditor.model': parsedInput.modelName,
                    'x-meditor.titleProperty': parsedInput.titleProperty,
                },
            },
            // Set state to the current (last) state from the states array.
            {
                $addFields: {
                    'x-meditor.state': {
                        $arrayElemAt: ['$x-meditor.states.target', -1],
                    },
                },
            },
            // This computes if a user can perform a transition. A use should not be able to perform transitions on adjacent states, unless explicitly set by the workflow.
            {
                $addFields: {
                    'x-meditor.banTransitions': {
                        // check if these conditions are equal, returning either true or false
                        $eq: [
                            {
                                $cond: {
                                    if: {
                                        $in: [
                                            '$x-meditor.state',
                                            this.#DISALLOWED_SELF_TRANSITIONS,
                                        ],
                                    },
                                    then: parsedInput.uid || '',
                                    else: '',
                                },
                            },
                            // the last uid to modify this document
                            { $arrayElemAt: ['$x-meditor.states.modifiedBy', -1] },
                        ],
                    },
                },
            },
        ]

        const [document] = await this.#db
            .collection(parsedInput.modelName)
            .aggregate(pipeline)
            .map(document => {
                const metadata = document['x-meditor']
                const banTransitions = metadata.banTransitions
                const documentState = metadata.state

                // Use the generated state map to determine: given the current state, which target states could this user transition this document to.
                metadata.targetStates = banTransitions
                    ? []
                    : sourceToTargetStateMap[documentState] || []

                return document
            })
            .toArray()

        return makeSafeObjectIDs(document)
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
            .aggregate(pipeline, { allowDiskUse: true })
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
            .aggregate(pipeline, { allowDiskUse: true })
            .map(this.formatHistoryItem)
            .toArray()

        return makeSafeObjectIDs(historyItem)
    }

    /**
     * Publications are tied to a document version. We'll treat this as a separate resource for now, and hopefully refactor the DB later...perhaps Publications as its own collection / table like comments.
     */
    async getDocumentPublications(
        documentTitle: string,
        modelName: string,
        titleProperty: string
    ): Promise<DocumentPublications[]> {
        const pipeline = [
            { $match: { [titleProperty]: documentTitle } },
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            { $project: { _id: 0, 'x-meditor.publishedTo': 1 } },
        ]

        // Grab only the first publications entry (which will contain a DocumentPublications[]). Needed because documents are duplicated instead of overwritten (see $sort, above).
        const [firstPublicationsEntry] = await this.#db
            .collection(modelName)
            .aggregate(pipeline, { allowDiskUse: true })
            .toArray()

        // There is no ObjectId to serialize since we $project it away from each entry.
        return firstPublicationsEntry['x-meditor'].publishedTo
    }

    /**
     * removes all document publications for a given Mongo document _id
     */
    async removeAllDocumentPublications(documentId: string, modelName: string) {
        await this.#db.collection(modelName).updateOne(
            {
                _id: new ObjectId(documentId),
            },
            {
                $set: {
                    'x-meditor.publishedTo': [],
                },
            }
        )
    }

    async getDocumentsForModel(
        modelName: string,
        searchOptions: DocumentsSearchOptions,
        titleProperty: string
    ): Promise<Document[]> {
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
            ...this.latestVersionOfDocumentQuery(titleProperty),

            // add states to the document
            ...this.addStatesToDocumentQuery(),

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
                throw new createError.BadRequest('Improperly formatted filter')
            }
        }

        let documents = await this.#db
            .collection(modelName)
            .aggregate(pipeline, { allowDiskUse: true })
            .toArray()

        return makeSafeObjectIDs(documents)
    }

    async getNumberOfUniqueDocumentsForModel(
        modelName: string,
        titleProperty: string
    ): Promise<number> {
        const documentCount = await this.#db
            .collection(modelName)
            .aggregate(
                [
                    { $group: { _id: '$' + titleProperty } },
                    { $group: { _id: null, count: { $sum: 1 } } },
                ],
                { allowDiskUse: true }
            )
            .toArray()

        return documentCount?.[0]?.count || 0
    }

    async insertDocument(document: any, modelName: string) {
        const { insertedId } = await this.#db
            .collection(modelName)
            .insertOne(document)

        const insertedDocument = await this.getDocumentById(
            insertedId.toString(),
            modelName
        )

        return insertedDocument
    }

    /**
     * documents have an `x-meditor.states` property, containing the states the document has transitioned through
     * this method provides the mechanism to add a new state to the document
     */
    async addDocumentStateChange(
        document: Document,
        newState: DocumentState,

        // allows for optionally updating the document while changing the document state.
        // this should rarely be done so the name is a bit dramatic and intentionally is not it's own method
        dangerouslyUpdateDocumentProperties?: Document
    ) {
        let updateQuery = {
            $push: {
                'x-meditor.states': newState,
            },
        }

        if (dangerouslyUpdateDocumentProperties) {
            // pull out the _id and x-meditor fields
            const {
                _id,
                'x-meditor': xMeditor,
                ...documentPropertiesToUpdate
            } = dangerouslyUpdateDocumentProperties

            // if additional properties to update are included, set those as well
            updateQuery = {
                ...updateQuery,
                ...(documentPropertiesToUpdate && {
                    $set: {
                        ...documentPropertiesToUpdate,
                    },
                }),
            }
        }

        await this.#db.collection(document['x-meditor'].model).updateOne(
            {
                // updating an existing document, use the _id instead of the documentTitle, this ensures no race conditions where two users are creating/updating simultaneously
                _id: new ObjectId(document._id),
            },
            updateQuery
        )
    }

    /**
     * we don't actually delete things from the database, rather we set deleted properties so the documents are no longer included
     * in query results. This allows documents to be recovered if accidentally deleted (which has happened more than a few times)
     */
    async deleteDocument(
        model: Model | ModelWithWorkflow,
        documentTitle: string,
        userUid: string
    ) {
        await this.#db.collection(model.name).updateMany(
            {
                [model.titleProperty]: documentTitle,
                'x-meditor.deletedOn': {
                    $exists: false,
                },
            },
            {
                $set: {
                    'x-meditor.deletedOn': new Date().toISOString(),
                    'x-meditor.deletedBy': userUid,
                },
            }
        )
    }

    private addStatesToDocumentQuery() {
        // build a state to return if the document version has no state
        let unspecifiedState = {
            target: this.#UNSPECIFIED_STATE_NAME,
            source: this.#UNSPECIFIED_STATE_NAME,
            modifiedBy: this.#UNKNOWN_USER,
            modifiedOn: new Date().toISOString(),
        }

        return [
            // Add unspecified state on docs with no states
            {
                $addFields: {
                    'x-meditor.states': {
                        $ifNull: ['$x-meditor.states', [unspecifiedState]],
                    },
                },
            },
            // Find last state
            {
                $addFields: {
                    'x-meditor.state': {
                        $arrayElemAt: ['$x-meditor.states.target', -1],
                    },
                },
            },
        ]
    }

    private async getDocumentById(
        documentId: string,
        modelName: string
    ): Promise<Document> {
        const comment = await this.#db.collection(modelName).findOne({
            _id: new ObjectId(documentId),
        })

        return makeSafeObjectIDs(comment)
    }
    /**
     * a commonly used query for retrieving the latest version of a document
     * the property of the document used can differ between models (one calls it title, one may call it name)
     */
    private latestVersionOfDocumentQuery(titleProperty: string) {
        return [
            // Sort descending by version (date)
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            // Grab all fields in the most recent version
            { $group: { _id: `$${titleProperty}`, doc: { $first: '$$ROOT' } } },
            // Put all fields of the most recent doc back into root of the document
            { $replaceRoot: { newRoot: '$doc' } },
        ]
    }
}

const db = new DocumentsDb()

async function getDocumentsDb() {
    await db.connect(getDb)

    return db
}

export { getDocumentsDb }
