import assert from 'assert'
import createError from 'http-errors'
import Fuse from 'fuse.js'
import log from '../lib/log'
import { DocumentRepository } from './repository'
import { formatValidationErrorMessage } from '../utils/jsonschema-validate'
import { getModel, getModelWithWorkflow } from '../models/service'
import { getTargetStatesFromWorkflow } from '../workflows/service'
import { getWebhookConfig, invokeWebhook } from '../webhooks/service'
import { immutableJSONPatch, JSONPatchDocument } from 'immutable-json-patch'
import { legacyHandleModelChanges } from './service.legacy'
import { publishMessageToQueueChannel } from '../publication-queue/service'
import { validate } from 'jsonschema'
import type { UserRole } from '../auth/types'
import type { ErrorData, User } from '../declarations'
import {
    constructEmailMessageForStateChange,
    shouldNotifyUsersOfStateChange,
} from '../email-notifications/service'
import type { DocumentsSearchOptions, ModelWithWorkflow } from '../models/types'

import type { Workflow, WorkflowEdge } from '../workflows/types'
import type {
    BulkDocumentResponse,
    Document,
    DocumentHistory,
    DocumentPublications,
    DocumentState,
} from './types'

const EMAIL_NOTIFICATIONS_QUEUE_CHANNEL =
    process.env.MEDITOR_NATS_NOTIFICATIONS_CHANNEL || 'meditor-notifications'
const DELETED_STATE = 'Deleted'
const INIT_STATE = 'Init'
const DRAFT_STATE = 'Draft'

export async function createDocument(
    documentToCreate: any,
    modelName: string,
    user: User,
    initialState: string = DRAFT_STATE // the initial state the document will be created in
): Promise<ErrorData<{ insertedDocument: Document; location: string }>> {
    try {
        const { _id, ...document } = documentToCreate // remove the database _id property

        //* Get the model to validate its schema and the workflow so that we can find information about the draft node, which is the only node that applies to creating a document.
        const [modelWithWorkflowError, modelWithWorkflow] =
            await getModelWithWorkflow(modelName, undefined, {
                populateMacroTemplates: true,
            })

        if (modelWithWorkflowError) {
            throw modelWithWorkflowError
        }

        const documentRepository = new DocumentRepository(
            modelName,
            modelWithWorkflow.titleProperty
        )
        const { schema, titleProperty, workflow } = modelWithWorkflow
        const initialNode = workflow.nodes.find(node => node.id === initialState)

        // validate that the document's state exists as a node in the model's workflow
        // ex. does "Modify-Review-Publish" workflow contain a "Draft" state?
        assert(
            initialNode,
            new createError.BadRequest(
                `The passed in state, ${initialState}, does not exist`
            )
        )

        // validate that there is at least one edge going from "Init" to the initialState
        assert(
            workflow.edges.some(
                edge => edge.source === INIT_STATE && edge.target === initialState
            ),
            new createError.BadRequest(
                `The passed in state, ${initialState}, is not an initial node in the workflow`
            )
        )

        //* The schema does not allow for our 'x-meditor' metadata property, so we have to allow all additional properties.
        const schemaWithAdditionalProperties = {
            ...JSON.parse(schema),
            additionalProperties: true,
        }
        const { errors } = validate(document, schemaWithAdditionalProperties)

        assert(
            !errors.length || initialNode.allowValidationErrors,
            new createError.BadRequest(
                `Document "${
                    document[titleProperty]
                }" does not validate against the schema for model "${modelName}": ${JSON.stringify(
                    errors.map(formatValidationErrorMessage)
                )}`
            )
        )

        //* This logic (and associated TODO) is ported from Meditor.js, saveDocument. Minimal modifications were made.
        const modifiedDate = new Date().toISOString()

        //* Create the INITAL state history for a NEW document or an Edited/Saved document which creates a new DB object of the document.
        const rootState = {
            source: INIT_STATE,
            target: initialState,
            modifiedOn: modifiedDate,
        }

        document['x-meditor'].modifiedOn = modifiedDate
        document['x-meditor'].modifiedBy = user.uid
        document['x-meditor'].states = [rootState]
        document['x-meditor'].publishedTo = []

        const insertedDocument = await documentRepository.insertOne(document)

        // ToDo: Review this fn and see if there's a more maintainable answer to models changing workflows.
        if (modelName === 'Models') {
            await legacyHandleModelChanges(insertedDocument)
        }

        //* We don't have consistency in [x-meditor] for all records, so the insertedDocument might not have a `state` property in metadata. Calling `getDocument` would return us the document's current state as [x-meditor].state because it is dynamically computed, but that call requires a lot of other information. At this point, it's simpler to use duplicated business logic here:
        const [last] = insertedDocument['x-meditor'].states.slice(-1)
        const targetState = last.target

        // Get the optional webhook URL from the workflow.
        const [firstCurrentEdge] = modelWithWorkflow.workflow.currentEdges
        const [_webhookConfigError, webhookConfig = null] = getWebhookConfig(
            firstCurrentEdge.webhookURL
        )

        // If there is a webhook URL, get the underlying webhook config and invoke it.
        if (webhookConfig) {
            const [error, response] = await invokeWebhook(webhookConfig, {
                model: modelWithWorkflow,
                document: insertedDocument,
                state: targetState,
            })

            // NOTE: Right now, we're not doing anything with the webhook response; a future story would be to include this and the previous document status notifications into document history. While we're changing document history, we should make sure that "Init" state is represented:
            /** 
            "states": [
                {
                    "source": "Init",
                    "target": "Draft",
                    "modifiedOn": "2027-08-03T16:57:26.401Z",
                    "modifiedBy": "username"
                }
            ]
            */

            if (error) {
                log.error(error)
            }

            if (response) {
                log.debug(response)
            }
        }

        safelyPublishDocumentChangeToQueue(
            modelWithWorkflow,
            insertedDocument,
            targetState
        )

        return [
            null,
            {
                insertedDocument,
                location: `/api/models/${modelName}/documents/${document[titleProperty]}`,
            },
        ]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

export async function getDocument(
    documentTitle: string,
    modelName: string,
    user: User,
    documentVersion?: string
): Promise<ErrorData<Document>> {
    try {
        const userRolesForModel = findAllowedUserRolesForModel(modelName, user?.roles)

        const [modelError, model] = await getModelWithWorkflow(modelName)

        if (modelError) {
            throw modelError // failed to get the model associated with the document
        }

        const sourceToTargetStateMap = createSourceToTargetStateMap(
            userRolesForModel,
            model.workflow.edges
        )

        const documentRepository = new DocumentRepository(
            modelName,
            model.titleProperty
        )

        const document = await documentRepository.findDocument(
            documentTitle,
            documentVersion,
            sourceToTargetStateMap,
            user?.uid
        )

        assert(
            document,
            new createError.NotFound(
                `Requested document, ${documentTitle}, in model, ${modelName}, was not found`
            )
        )

        return [null, document]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

// TODO: add OPTIONAL pagination (don't break existing scripts, perhaps the existence of pagination query params changes the output?)
export async function getDocumentsForModel(
    modelName: string,
    searchOptions?: DocumentsSearchOptions
): Promise<ErrorData<Document[]>> {
    try {
        const [modelError, model] = await getModelWithWorkflow(modelName) // need the model to get the related workflow and title property

        if (modelError) {
            throw modelError
        }

        const documentRepository = new DocumentRepository(
            modelName,
            model.titleProperty
        )

        let documents = await documentRepository.find(searchOptions)

        if (searchOptions?.searchTerm) {
            // user is attempting a search. Mongo text search is VERY basic, so we'll utilize fuse.js to do the search
            const fuse = new Fuse(documents, {
                keys: [model.titleProperty], // TODO: investigate searching more than just the title property
            })

            // fuse.js returns search results with extra information, we just need the matching document
            documents = fuse
                .search(searchOptions.searchTerm)
                .map(searchResult => searchResult.item)
        }

        // add target states to documents
        documents = documents.map(document => ({
            ...document,
            'x-meditor': {
                ...document['x-meditor'],
                targetStates: getTargetStatesFromWorkflow(
                    document['x-meditor'].state,
                    model.workflow
                ), // populate document with states it can transition into
            },
        }))

        return [null, documents]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

export async function getDocumentHistory(
    documentTitle: string,
    modelName: string,
    versionId?: string
): Promise<ErrorData<DocumentHistory[]>> {
    try {
        const [modelError, model] = await getModel(modelName)

        if (modelError) {
            throw modelError
        }

        const documentRepository = new DocumentRepository(
            modelName,
            model.titleProperty
        )

        const historyItems = await documentRepository.historyByTitle(
            documentTitle,
            versionId
        )

        return [null, historyItems.map(formatHistoryItem)]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

function formatHistoryItem(item: any): DocumentHistory {
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

export async function getDocumentPublications(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentPublications[]>> {
    try {
        const [modelError, model] = await getModel(modelName)

        if (modelError) {
            throw modelError
        }

        const documentRepository = new DocumentRepository(
            modelName,
            model.titleProperty
        )

        const publications = await documentRepository.publicationsByTitle(
            documentTitle
        )

        return [null, publications]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

export async function cloneDocument(
    titleOfDocumentToClone: string,
    titleOfNewDocument: string,
    modelName: string,
    user: User
): Promise<ErrorData<Document>> {
    try {
        assert(user, new createError.Unauthorized('User is not authenticated'))

        const [modelError, model] = await getModel(modelName)

        if (modelError) {
            throw modelError
        }

        // get the document we'll be cloning
        const [documentToCloneError, documentToClone] = await getDocument(
            titleOfDocumentToClone,
            modelName,
            user
        )

        if (documentToCloneError) {
            // something went wrong while getting the document to clone
            throw documentToCloneError
        }

        const titleProperty = documentToClone['x-meditor'].titleProperty

        // create the new document with the new title
        const { _id, ...newDocument } = {
            ...documentToClone,
            [titleProperty]: titleOfNewDocument,
        }

        const documentRepository = new DocumentRepository(
            modelName,
            model.titleProperty
        )

        // make sure no document exists with the new title
        const newDocumentAlreadyExists = await documentRepository.existsByTitle(
            newDocument[titleProperty]
        )

        assert(
            !newDocumentAlreadyExists,
            new createError.BadRequest(
                `A document already exists with the title: '${newDocument[titleProperty]}'`
            )
        )

        return createDocument(newDocument, modelName, user)
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

/**
 * apply a set of JSON patch operations to a list of documents
 */
export async function bulkPatchDocuments(
    documentTitles: Array<string>,
    modelName: string,
    user: User,
    operations: JSONPatchDocument
) {
    try {
        const result = await Promise.allSettled(
            documentTitles.map(async (title): Promise<BulkDocumentResponse> => {
                //* perform the patch operations on the given document
                const [error] = await patchDocument(
                    title,
                    modelName,
                    user,
                    operations
                )

                return {
                    title,
                    status: error?.status ?? 200,
                    ...(error && { error: error.message }),
                }
            })
        )

        return [
            null,
            result.map(
                item => (item as PromiseFulfilledResult<BulkDocumentResponse>).value
            ),
        ]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

/**
 * patch a single document given a list of JSON Patch operations
 */
export async function patchDocument(
    documentTitle: string,
    modelName: string,
    user: User,
    operations: JSONPatchDocument
): Promise<ErrorData<{ insertedDocument: Document; location: string }>> {
    try {
        // get the existing document, we'll perform all patch operations on the database copy of a document
        const [existingDocumentError, existingDocument] = await getDocument(
            documentTitle,
            modelName,
            user
        )

        if (existingDocumentError) {
            throw existingDocumentError
        }

        // apply JSON Patch operations to the document
        const [patchErrors, patchedDocument] = jsonPatch(existingDocument, operations)

        assert(!patchErrors, new createError.BadRequest(patchErrors.message))

        // all operations successfully made, save to db as a new document
        return await createDocument(patchedDocument, modelName, user)
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

/**
 * one of the central parts of mEditor, responsible for transitioning a document through a workflow by changing it's state.
 *
 * after changing the document state, will notify the user and send out a publication message
 */
export async function changeDocumentState(
    documentTitle: string,
    modelName: string,
    newState: string, // must be a string, not enum, due to states not existing at compile time,
    user: User,

    // changeDocumentState options
    options?: {
        disableEmailNotifications?: boolean
        disableQueuePublication?: boolean
        dangerouslyUpdateDocumentProperties?: Document
    }
): Promise<ErrorData<Document>> {
    try {
        assert(newState, new createError.BadRequest('No state provided'))
        assert(user, new createError.Unauthorized('User is not logged in'))

        const [modelError, model] = await getModelWithWorkflow(modelName)

        if (modelError) {
            // model must exist
            throw modelError
        }

        const documentRepository = new DocumentRepository(
            modelName,
            model.titleProperty
        )

        // fetch the requested document
        const [documentError, document] = await getDocument(
            documentTitle,
            modelName,
            user
        )

        if (documentError) {
            // document must exist
            throw documentError
        }

        // try to construct a new state, this will throw if any of the business rules fail
        const state = await constructNewDocumentState(document, model, newState, user)

        // got a new state, update the documents state in the database
        const updatedDocument = await documentRepository.changeDocumentState(
            document,
            state,
            options?.dangerouslyUpdateDocumentProperties
        )

        // send email notification of state change
        if (!options?.disableEmailNotifications) {
            await safelyNotifyOfStateChange(
                model,
                document,
                newState,
                getWorkflowEdgesMatchingSourceAndTarget(
                    model.workflow,
                    document['x-meditor'].state,
                    newState
                )[0],
                user
            )
        } else {
            log.debug(
                'User requested to change document state without sending email notifications'
            )
        }

        // Get the optional webhook URL from the workflow.
        const [firstCurrentEdge] = model.workflow.currentEdges
        const [_webhookConfigError, webhookConfig = null] = getWebhookConfig(
            firstCurrentEdge.webhookURL
        )

        // If there is a webhook URL, get the underlying webhook config and invoke it.
        if (webhookConfig) {
            const [error, response] = await invokeWebhook(webhookConfig, {
                model,
                document,
                state: newState,
            })

            // NOTE: Right now, we're not doing anything with the webhook response; a future story would be to include this and the previous document status notifications into document history. While we're changing document history, we should make sure that "Init" state is represented:
            /** 
            "states": [
                {
                    "source": "Init",
                    "target": "Draft",
                    "modifiedOn": "2027-08-03T16:57:26.401Z",
                    "modifiedBy": "username"
                }
            ]
            */

            if (error) {
                log.error(error)
            }

            if (response) {
                log.debug(response)
            }
        }

        if (!options?.disableQueuePublication) {
            safelyPublishDocumentChangeToQueue(model, document, newState)
        } else {
            log.debug(
                'User requested to change document state without publishing the state change to the queue'
            )
        }

        if (newState === DELETED_STATE) {
            await safelyDeleteDocument(model, document, user)
        }

        return [null, updatedDocument]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

/**
 * Apply a state transition to multiple documents at once. Modifying the state transitions the documents through a workflow.
 *
 * Example: publishing 1000 collections at once
 */
export async function bulkChangeDocumentState(
    documentTitles: Array<string>,
    modelName: string,
    newState: string, // must be a string, not enum, due to states not existing at compile time,
    user: User,
    options?: {
        disableEmailNotifications?: boolean
    }
): Promise<ErrorData<Document>> {
    try {
        const result = await Promise.allSettled(
            documentTitles.map(async title => {
                //* perform the change document state operations on the given document
                const [error] = await changeDocumentState(
                    title,
                    modelName,
                    newState,
                    user,
                    {
                        disableEmailNotifications:
                            options.disableEmailNotifications ?? true, // default to disabling email notifications
                    }
                )

                return {
                    title,
                    status: error?.status ?? 200,
                    ...(error && { error: error.message }),
                }
            })
        )

        return [
            null,
            result.map(
                item => (item as PromiseFulfilledResult<BulkDocumentResponse>).value
            ),
        ]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}

/**
 * responsible for constructing a new state for the document
 *
 * This has many business rules, the summarized version of the rules is:
 *
 *  - new state has to be a valid state in the workflow
 *  - new state must not be the same as the current state
 *  - user must be authenticated and have roles for the given model
 *  - workflow must be properly configured, no duplicate edges (how do we know which edge to follow to get to the requested state?)
 */
export async function constructNewDocumentState(
    document: Document,
    model: ModelWithWorkflow,
    newState: string,
    user: User
): Promise<DocumentState> {
    const targetStates = getTargetStatesFromWorkflow(
        document['x-meditor'].state,
        model.workflow
    )

    const matchingEdges = getWorkflowEdgesMatchingSourceAndTarget(
        model.workflow,
        document['x-meditor'].state,
        newState
    )

    assert(
        newState !== document['x-meditor'].state,
        new createError.BadRequest(
            `Cannot transition to state [${newState}] as the document is in this state already`
        )
    )

    assert(
        targetStates.indexOf(newState) >= 0,
        new createError.BadRequest(
            `Cannot transition to state [${newState}] as it is not a valid state in the workflow`
        )
    )

    assert(
        document['x-meditor'].targetStates.indexOf(newState) >= 0,
        new createError.BadRequest(
            `User does not have the permissions to transition to state ${newState}.`
        )
    )

    assert(
        matchingEdges.length === 1,
        new createError.InternalServerError(
            `Workflow, ${model.workflow.name}, is misconfigured! There are duplicate edges from '${document['x-meditor'].state}' to '${newState}'.`
        )
    )

    // create the new document state!
    return {
        source: document['x-meditor'].state,
        target: newState,
        modifiedOn: new Date().toISOString(),
        modifiedBy: user.uid,
    }
}

export async function safelyNotifyOfStateChange(
    model: ModelWithWorkflow,
    document: Document,
    newState: string,
    currentEdge: WorkflowEdge,
    user: User
) {
    try {
        if (shouldNotifyUsersOfStateChange(newState, currentEdge)) {
            const emailMessage = await constructEmailMessageForStateChange(
                model,
                document,
                newState,
                currentEdge,
                user
            )

            if (process.env.DISABLE_EMAIL_NOTIFICATIONS) {
                log.warn(
                    `The 'DISABLE_EMAIL_NOTIFICATIONS' environment variable is set to 'true'!`
                )
                log.warn(
                    `Email notifications were disabled while attempting to send the following email:`
                )
                log.debug(emailMessage)
                return
            }

            // publish the email to the "notifications" queue channel
            //? A separate microservice, "meditor-notifier", is responsible for actually sending the email
            await publishMessageToQueueChannel(
                EMAIL_NOTIFICATIONS_QUEUE_CHANNEL,
                emailMessage
            )
        }
    } catch (err) {
        //! log the error but failing to send an email notification should NOT stop the state change as it is a side effect
        log.error(err)
    }
}

/**
 * Publishes to queue, but does not rethrow any errors. This function is a good choice when a queue publishing failure should not halt the functions lower in the call stack.
 */
export async function safelyPublishDocumentChangeToQueue(
    model: ModelWithWorkflow,
    document: Document,
    state: string
) {
    try {
        if (isPublishableWithWorkflowSupport(model, state)) {
            const documentRepository = new DocumentRepository(
                model.name,
                model.titleProperty
            )

            // turns "Data Release" into "Data-Release"
            const channelName = model.name.replace(/ /g, '-')

            // before we publish, first delete existing publication statuses
            //? if we don't, user may be confused and think the old publication statuses still apply
            await documentRepository.removePublicationsById(document._id)

            // publish the document state change to the right channel
            //? One or more subscribers can be subscribed to this particular channel, these are external subscribers
            //? (ex. an external subscriber that can publish "UMM-C" model documents to CMR)
            await publishMessageToQueueChannel(channelName, {
                id: document._id,
                document,
                model: {
                    titleProperty: model.titleProperty,
                },
                state,
                time: Date.now(),
            })
        }
    } catch (err) {
        //! log the error but failing to publish should NOT stop the state change as it is a side effect
        log.error(err)
    }
}

export async function safelyDeleteDocument(
    model: ModelWithWorkflow,
    document: Document,
    user: User
) {
    try {
        log.debug(
            `Handling delete document for ${model.name} - ${
                document[model.titleProperty]
            }`
        )

        const documentRepository = new DocumentRepository(
            model.name,
            model.titleProperty
        )

        await documentRepository.deleteOneByTitle(
            document[model.titleProperty],
            user.uid
        )

        log.debug(
            `Deleted ${model.name} - ${document[model.titleProperty]} (deleted by: ${
                user.uid
            })`
        )
    } catch (err) {
        //! log the error but don't block state change
        log.error(err)
    }
}

/**
 * should only block publishing a state change if the workflow is using "publishable" on states/nodes
 * and someone has explicitly set a node to not publishable
 */
export function isPublishableWithWorkflowSupport(
    model: ModelWithWorkflow,
    state: string
) {
    if (model.workflow.nodes.find(node => node.publishable)) {
        // this workflow supports "publishable"
        log.debug(
            `The workflow, ${model.workflow.name}, has at least one node with "publishable" set.`
        )

        const matchingNode = model.workflow.nodes.find(node => node.id === state)

        //! don't combine these into !matchingNode?.publishable, this is intentionally separately checking that the node exists AND is not publishable
        if (matchingNode && !matchingNode.publishable) {
            log.debug(`State, ${state}, is not publishable, skipping publication.`)
            return false
        }
    }

    // return true by default
    return true
}

/**
 * The workflow edges describe all possible transitions for a workflow. Given an array of roles, return as a map the workflow edges matching those roles.
 */
export function createSourceToTargetStateMap(
    userRolesForModel: string[] = [],
    workflowEdges: WorkflowEdge[] = []
): { [key: WorkflowEdge['source']]: WorkflowEdge['target'][] } {
    return workflowEdges.reduce((accumulator, edge) => {
        if (userRolesForModel.includes(edge.role)) {
            if (!Array.isArray(accumulator[edge.source])) {
                accumulator[edge.source] = []
            }

            accumulator[edge.source].push(edge.target)
        }

        return accumulator
    }, {})
}

/**
 * Given its inputs, this function returns an array of roles / actions a user has for a model. Users will have permissions defined in their roles property (see this function's typings). Where the model's name and the user's role.model name matches, a role (might be helpful to think of this as an actor, like "Author", "Reviewer", or "Publisher") will be returned for that model name.
 */
export function findAllowedUserRolesForModel(
    modelName: string = '',
    roles: UserRole[] = []
): UserRole['role'][] {
    return roles.reduce((accumulator, role) => {
        if (role.model === modelName) {
            return [...accumulator, role.role]
        }

        return accumulator
    }, [])
}

function getWorkflowEdgesMatchingSourceAndTarget(
    workflow: Workflow,
    source: string,
    target: string
): WorkflowEdge[] {
    return workflow.edges.filter(
        edge => edge.source === source && edge.target === target
    )
}

function jsonPatch(
    document: Document,
    operations: JSONPatchDocument
): ErrorData<Document> {
    try {
        return [null, immutableJSONPatch(document, operations)]
    } catch (err) {
        console.error(err)
        return [err, null]
    }
}

/**
 * Validates a document against its schema strictly, allowing no additiona properties.
 */
export async function strictValidateDocument(
    documentToValidate: any,
    modelName: string
): Promise<ErrorData<Document>> {
    try {
        //* Get the model for its schema and title property.
        const [modelError, model] = await getModel(modelName, {
            includeId: false,
            populateMacroTemplates: true,
        })

        if (modelError) {
            throw modelError
        }

        const { schema, titleProperty } = model
        const { errors } = validate(documentToValidate, {
            ...JSON.parse(schema),
            additionalProperties: false,
        })

        //* Unlike most use-cases, we don't want to throw for a validation error; we just return it.
        if (errors.length) {
            const validationError = new createError.BadRequest(
                `Document "${
                    documentToValidate[titleProperty]
                }" does not validate against the schema for model "${modelName}": ${JSON.stringify(
                    errors.map(formatValidationErrorMessage)
                )}`
            )

            return [validationError, null]
        }

        return [null, documentToValidate]
    } catch (error) {
        log.error(error)

        return [error, null]
    }
}
