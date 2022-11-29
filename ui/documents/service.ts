import Fuse from 'fuse.js'
import type { User, UserRole } from '../auth/types'
import type { ErrorData } from '../declarations'
import {
    constructEmailMessageForStateChange,
    shouldNotifyUsersOfStateChange,
} from '../email-notifications/service'
import { getModel, getModelWithWorkflow } from '../models/service'
import type { DocumentsSearchOptions, ModelWithWorkflow } from '../models/types'
import { publishMessageToQueueChannel } from '../publication-queue/service'
import { ErrorCode, HttpException } from '../utils/errors'
import { getTargetStatesFromWorkflow } from '../workflows/service'
import type { Workflow, WorkflowEdge, WorkflowNode } from '../workflows/types'
import { getDocumentsDb } from './db'
import type {
    Document,
    DocumentHistory,
    DocumentPublications,
    DocumentState,
} from './types'

const EMAIL_NOTIFICATIONS_QUEUE_CHANNEL =
    process.env.MEDITOR_NATS_NOTIFICATIONS_CHANNEL || 'meditor-notifications'
const DELETED_STATE = 'Deleted'

export async function getDocument(
    documentTitle: string,
    modelName: string,
    user: User,
    documentVersion?: string
): Promise<ErrorData<Document>> {
    try {
        const documentsDb = await getDocumentsDb()
        const userRolesForModel = findAllowedUserRolesForModel(modelName, user?.roles)

        const [modelError, { titleProperty = 'title', workflow }] =
            await getModelWithWorkflow(modelName)

        if (modelError) {
            throw modelError // failed to get the model associated with the document
        }

        const sourceToTargetStateMap = createSourceToTargetStateMap(
            userRolesForModel,
            workflow.edges
        )

        const document = await documentsDb.getDocument(
            documentTitle,
            documentVersion,
            modelName,
            sourceToTargetStateMap,
            titleProperty,
            user?.uid
        )

        if (!document) {
            throw new HttpException(
                ErrorCode.NotFound,
                `Requested document, ${documentTitle}, in model, ${modelName}, was not found`
            )
        }

        return [null, document]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

// TODO: add OPTIONAL pagination (don't break existing scripts, perhaps the existence of pagination query params changes the output?)
export async function getDocumentsForModel(
    modelName: string,
    searchOptions?: DocumentsSearchOptions
): Promise<ErrorData<Document[]>> {
    try {
        const documentsDb = await getDocumentsDb()

        const [modelError, { titleProperty = 'title', workflow }] =
            await getModelWithWorkflow(modelName) // need the model to get the related workflow and title property

        if (modelError) {
            throw modelError
        }

        let documents = await documentsDb.getDocumentsForModel(
            modelName,
            searchOptions,
            titleProperty
        )

        if (searchOptions?.searchTerm) {
            // user is attempting a search. Mongo text search is VERY basic, so we'll utilize fuse.js to do the search
            const fuse = new Fuse(documents, {
                keys: [titleProperty], // TODO: investigate searching more than just the title property
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
                    workflow
                ), // populate document with states it can transition into
            },
        }))

        return [null, documents]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export async function getDocumentHistory(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentHistory[]>> {
    try {
        const documentsDb = await getDocumentsDb()
        const [modelError, { titleProperty = '' }] = await getModel(modelName)

        if (modelError) {
            throw modelError
        }

        const historyItems = await documentsDb.getDocumentHistory(
            documentTitle,
            modelName,
            titleProperty
        )

        return [null, historyItems]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export async function getDocumentHistoryByVersion(
    versionId: string,
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentHistory>> {
    try {
        const documentsDb = await getDocumentsDb()
        const [modelError, { titleProperty = '' }] = await getModel(modelName)

        if (modelError) {
            throw modelError
        }

        const historyItem = await documentsDb.getDocumentHistoryByVersion(
            documentTitle,
            modelName,
            titleProperty,
            versionId
        )

        return [null, historyItem]
    } catch (error) {
        console.error(error)

        return [error, null]
    }
}

export async function getDocumentPublications(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentPublications[]>> {
    try {
        const documentsDb = await getDocumentsDb()
        const [modelError, { titleProperty = '' }] = await getModel(modelName)

        if (modelError) {
            throw modelError
        }

        const publications = await documentsDb.getDocumentPublications(
            documentTitle,
            modelName,
            titleProperty
        )

        return [null, publications]
    } catch (error) {
        console.error(error)

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
        if (!newState) {
            throw new HttpException(ErrorCode.BadRequest, 'No state provided')
        }

        if (!user) {
            throw new HttpException(ErrorCode.Unauthorized, 'User is not logged in')
        }

        const documentsDb = await getDocumentsDb()
        const [modelError, model] = await getModelWithWorkflow(modelName)

        if (modelError) {
            // model must exist
            throw modelError
        }

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
        const ok = await documentsDb.addDocumentStateChange(
            document,
            state,
            options?.dangerouslyUpdateDocumentProperties
        )

        if (!ok) {
            // safety check, not sure how this would actually happen, but just in case it does, this stops the user from thinking the update went through
            //? why? because the underlying DB call would only fail if the document didn't exist. We just queried for it above and we never actually delete documents
            throw new HttpException(
                ErrorCode.InternalServerError,
                'Failed to change document state'
            )
        }

        // get the updated document from the database
        const [updatedDocumentError, updatedDocument] = await getDocument(
            documentTitle,
            modelName,
            user
        )

        if (updatedDocumentError) {
            throw updatedDocumentError
        }

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
            console.debug(
                'User requested to change document state without sending email notifications'
            )
        }

        if (!options?.disableQueuePublication) {
            await safelyPublishStateChangeToQueue(model, document, newState)
        } else {
            console.debug(
                'User requested to change document state without publishing the state change to the queue'
            )
        }

        if (newState === DELETED_STATE) {
            await safelyDeleteDocument(model, document, user)
        }

        return [null, updatedDocument]
    } catch (error) {
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

    //! can't transition to a state the document is already in
    if (newState === document['x-meditor'].state) {
        throw new HttpException(
            ErrorCode.BadRequest,
            `Cannot transition to state [${newState}] as the document is in this state already`
        )
    }

    //! can't transition to a state that isn't in the workflow
    if (targetStates.indexOf(newState) < 0) {
        throw new HttpException(
            ErrorCode.BadRequest,
            `Cannot transition to state [${newState}] as it is not a valid state in the workflow`
        )
    }

    //! can't transition to a state the user does not have permission to transition to
    if (document['x-meditor'].targetStates.indexOf(newState) < 0) {
        throw new HttpException(
            ErrorCode.BadRequest,
            `User does not have the permissions to transition to state ${newState}.`
        )
    }

    //! can't transition if the workflow has two edges with the same source and same target (how do we know which edge to follow?)
    if (matchingEdges.length !== 1) {
        throw new HttpException(
            ErrorCode.InternalServerError,
            `Workflow, ${model.workflow.name}, is misconfigured! There are duplicate edges from '${document['x-meditor'].state}' to '${newState}'.`
        )
    }

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

            // publish the email to the "notifications" queue channel
            //? A separate microservice, "meditor-notifier", is responsible for actually sending the email
            await publishMessageToQueueChannel(
                EMAIL_NOTIFICATIONS_QUEUE_CHANNEL,
                emailMessage
            )
        }
    } catch (err) {
        //! log the error but failing to send an email notification should NOT stop the state change as it is a side effect
        console.error(err)
    }
}

export async function safelyPublishStateChangeToQueue(
    model: ModelWithWorkflow,
    document: Document,
    state: string
) {
    try {
        if (shouldPublishStateChangeToQueue(model, state)) {
            // turns "Data Release" into "Data-Release"
            const channelName = model.name.replace(/ /g, '-')

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
        console.error(err)
    }
}

export async function safelyDeleteDocument(
    model: ModelWithWorkflow,
    document: Document,
    user: User
) {
    try {
        console.debug(
            `Handling delete document for ${model.name} - ${
                document[model.titleProperty]
            }`
        )

        const documentsDb = await getDocumentsDb()
        await documentsDb.deleteDocument(
            model,
            document[model.titleProperty],
            user.uid
        )

        console.debug(
            `Deleted ${model.name} - ${document[model.titleProperty]} (deleted by: ${
                user.uid
            })`
        )
    } catch (err) {
        //! log the error but don't block state change
        console.error(err)
    }
}

/**
 * should only block publishing a state change if the workflow is using "publishable" on states/nodes
 * and someone has explicitly set a node to not publishable
 */
export function shouldPublishStateChangeToQueue(
    model: ModelWithWorkflow,
    state: string
) {
    if (model.workflow.nodes.find(node => node.publishable)) {
        // this workflow supports "publishable"
        console.debug(
            `The workflow, ${model.workflow.name}, has at least one node with "publishable" set.`
        )

        const matchingNode = model.workflow.nodes.find(node => node.id === state)

        //! don't combine these into !matchingNode?.publishable, this is intentionally separately checking that the node exists AND is not publishable
        if (matchingNode && !matchingNode.publishable) {
            console.debug(
                `State, ${state}, is not publishable, skipping publication.`
            )
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
    roles: User['roles'] = []
): UserRole['role'][] {
    return roles.reduce((accumulator, role) => {
        if (role.model === modelName) {
            return [...accumulator, role.role]
        }

        return accumulator
    }, [])
}

/**
 * Returns all workflow edges that a user's permissions allow.
 * todo: delete the following note after complete refactor of old mEditor API:
 * this is like `getDocumentModelMetadata`'s `that.sourceStates` and `that.targetStates` without actually finding unique source and target values (this gives you the base info to do that).
 */
function findAllowedWorkflowEdgesForUserRoles(
    roles: User['roles'] = [],
    workflow: Workflow
): WorkflowEdge[] {
    return workflow.edges.filter(workflowNode => {
        return !!roles.find(permission => permission.role === workflowNode.role)
    })
}

/**
 * Returns all workflow nodes that are marked `readyForUse: true`.
 * todo: delete the following note after complete refactor of old mEditor API:
 * this is `getDocumentModelMetadata`'s `that.readyNodes`
 */
function findWorkflowNodesReadyForUse(workflow: Workflow): WorkflowNode['id'][] {
    return workflow.nodes.reduce((accumulator, workflowNode) => {
        if (workflowNode.readyForUse) {
            return [...accumulator, workflowNode.id]
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
