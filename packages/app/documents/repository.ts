import createError from 'http-errors'
import { BaseRepository } from '../lib/database/base-repository'
import { convertLuceneQueryToMongo } from '../utils/search'
import { DocumentsSearchOptions } from '../models/types'
import { getDocumentInputSchema } from './schema'
import { UpdateResult } from 'mongodb'
import { User } from 'declarations'
import { WorkflowEdge } from '../workflows/types'
import type { Document, DocumentState } from './types'

export class DocumentRepository extends BaseRepository<Document> {
    #UNSPECIFIED_STATE_NAME = 'Unspecified'
    #UNKNOWN_USER = 'Unknown'
    #DEFAULT_SORT = '-x-meditor.modifiedOn'
    #DISALLOWED_SELF_TRANSITIONS = ['Under Review', 'Approved']

    constructor(collection: string, titleProperty?: string) {
        super(collection, titleProperty)
    }

    async findDocument(
        documentTitle: string,
        documentVersion: string,
        sourceToTargetStateMap: {
            [key: WorkflowEdge['source']]: WorkflowEdge['target'][]
        },
        uid?: User['uid']
    ): Promise<Document | null> {
        // Parse input to make sure DB calls are with expected inputs.
        const parsedInput = getDocumentInputSchema.parse({
            documentTitle,
            documentVersion,
            modelName: this.collection,
            sourceToTargetStateMap,
            titleProperty: this.titleProperty,
            uid,
        })

        // Get the requested document
        const document = await this.findOne([
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

            // we only want the latest version of the document
            ...this.latestVersionOfDocumentQuery(),

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
        ])

        // Use the generated state map to determine: given the current state, which target states could this user transition this document to.
        document['x-meditor'].targetStates = document['x-meditor'].banTransitions
            ? [] // user is banned from doing any state transitions
            : sourceToTargetStateMap[document['x-meditor'].state] || []

        return document
    }

    async findAll(searchOptions?: DocumentsSearchOptions) {
        // parse out what we'll sort on, or fall back to the default
        const sortProperty = (searchOptions?.sort || this.#DEFAULT_SORT).replace(
            /^-/,
            ''
        )

        const sortDir =
            (searchOptions?.sort || this.#DEFAULT_SORT).charAt(0) == '-' ? -1 : 1

        const pipeline = [
            ...this.noDeletedDocumentsQuery(),

            // since documents can be so large, only include a handful of needed fields
            // TODO: once pagination is added to the API, this shouldn't be needed anymore
            {
                $project: {
                    _id: 0,
                    title: `$${this.titleProperty}`, // add a title field that matches the `titleProperty` field
                    [this.titleProperty]: 1,
                    'x-meditor': 1,
                },
            },

            ...this.latestVersionOfDocumentQuery(),
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

        return this.aggregate<Document>(pipeline)
    }

    /**
     * Retrieves all versions of a document by it's title and optional version
     */
    async historyByTitle(title: string, versionId?: string): Promise<Document[]> {
        return this.aggregate<Document>([
            ...this.noDeletedDocumentsQuery(),
            {
                $match: {
                    [this.titleProperty]: title,
                    ...(versionId && { 'x-meditor.modifiedOn': versionId }),
                },
            },
            { $sort: { 'x-meditor.modifiedOn': -1 } },
        ])
    }

    async publicationsByTitle(title: string) {
        const [firstPublicationsEntry] = await this.aggregate<Document>([
            { $match: { [this.titleProperty]: title } },
            { $sort: { 'x-meditor.modifiedOn': -1 } },
            { $project: { _id: 0, 'x-meditor.publishedTo': 1 } },
        ])

        return firstPublicationsEntry?.['x-meditor'].publishedTo
    }

    async removePublicationsById(id: string) {
        return this.updateOneById(id, {
            $set: {
                'x-meditor.publishedTo': [],
            },
        })
    }

    async changeDocumentState(
        document: Document,
        newState: DocumentState,

        // allows for optionally updating the document while changing the document state.
        // this should rarely be done so the name is a bit dramatic and intentionally is not it's own method
        dangerouslyUpdateDocumentProperties?: Document
    ) {
        const updateQuery = {
            $push: {
                'x-meditor.states': newState,
            },
            ...(dangerouslyUpdateDocumentProperties && {
                $set: Object.fromEntries(
                    Object.entries(dangerouslyUpdateDocumentProperties).filter(
                        ([key]) => !['_id', 'x-meditor'].includes(key)
                    ) // sensitive fields we don't want a user to be able to update on their own!
                ),
            }),
        }

        return this.updateOneById(document._id, updateQuery)
    }

    /**
     * TODO: LEGACY - in need of refactor or documentation
     */
    async updateHistory(
        id: string,
        newStateHistory: any,
        oldHistory: any
    ): Promise<UpdateResult> {
        const db = await this.connectionPromise
        return db.collection(this.collection).updateOne(
            { _id: id },
            {
                $set: {
                    'x-meditor.states': newStateHistory,
                    'x-meditor.backupStates': oldHistory,
                },
            }
        )
    }

    async getUniqueFieldValues(fieldName: string) {
        const documents = await this.aggregate<{
            _id: string
            field: string
        }>([
            { $match: { 'x-meditor.deletedOn': { $exists: false } } }, // Do not grab deleted documents.
            { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort so that later queries can get only the latest version.
            {
                $group: {
                    _id: `$${fieldName}`,
                    field: { $first: `$${fieldName}` },
                },
            }, // Put only the first (see sort, above) desired field on the grouped document.
            { $sort: { field: 1 } }, // Sort for macro consumption.
        ])

        return documents.map(document => document.field)
    }

    async getDependenciesByTitle(dependentField: string) {
        return this.aggregate([
            { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
            { $group: { _id: '$title', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
            { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
            {
                $project: {
                    _id: 0,
                    title: 1,
                    [dependentField]: 1,
                },
            },
        ])
    }

    protected addStatesToDocumentQuery() {
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
}
