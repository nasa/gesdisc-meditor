import Fuse from 'fuse.js'
import { validate } from 'jsonschema'
import type { User, UserRole } from '../auth/types'
import type { ErrorData } from '../declarations'
import { getModel, getModelWithWorkflow } from '../models/service'
import type { DocumentsSearchOptions } from '../models/types'
import { ErrorCode, HttpException } from '../utils/errors'
import { formatValidationErrorMessage } from '../utils/jsonschema-validate'
import { getTargetStatesFromWorkflow, getWorkflow } from '../workflows/service'
import type { Workflow, WorkflowEdge, WorkflowNode } from '../workflows/types'
import { getDocumentsDb } from './db'
import { legacyHandleModelChanges } from './service.legacy'
import type { Document, DocumentHistory, DocumentPublications } from './types'

const GENERIC_WORKFLOW_EDGE = { source: 'Init', target: 'Draft' }
const GENERIC_WORKFLOW_ROOT = 'Init'

export async function createDocument(
    document: any,
    modelName: string,
    user: User
): Promise<ErrorData<{ insertedDocument: Document; location: string }>> {
    try {
        const documentsDb = await getDocumentsDb()

        // ToDo: Right now we allow additional properties in our schema validation (see `validate` in this function) because we put metadata on the document record. We could pull off the metadata, strictly validate the document, then proceed. Before implementing that, we need to make sure that we've removed all "legacy" extra properties on the document like `banTransitions`. See "ref: validate", below.
        // const { ['x-meditor']: metadata, ...documentWithoutMetadata } = document

        //* Get the model to validate its schema. We need to workflow name to determine how to handle validation errors.
        const [modelError, model] = await getModel(modelName)

        if (modelError) {
            throw modelError
        }

        const { schema, titleProperty, workflow: workflowName } = model

        //* Get the model's workflow so that we can find information about the draft node, which is the only node that applies to creating a document.
        const [workflowError, workflow] = await getWorkflow(workflowName)

        if (workflowError) {
            throw workflowError
        }

        const { allowValidationErrors } = workflow.nodes.find(
            node => node.id === 'Draft'
        )

        //! "ref: validate"
        // const { errors } = validate(documentWithoutMetadata, JSON.parse(schema))
        //* The schema does not allow for our 'x-meditor' metadata property, so we have to allow all additional properties.
        const schemaWithAdditionalProperties = {
            ...JSON.parse(schema),
            additionalProperties: true,
        }
        const { errors } = validate(document, schemaWithAdditionalProperties)

        if (errors.length && !allowValidationErrors) {
            throw new HttpException(
                ErrorCode.ValidationError,
                `Document "${
                    document[titleProperty]
                }" does not validate against the schema for model "${modelName}": ${JSON.stringify(
                    errors.map(formatValidationErrorMessage)
                )}`
            )
        }

        //! <refactor>
        // ToDo:  Refactor this, once the larger RESTful API refactor has time to deploy and settle.
        //* This logic (and associated TODO) is ported from Meditor.js, saveDocument. Minimal modifications were made.
        const rootState = { ...GENERIC_WORKFLOW_EDGE }
        // @ts-ignore
        rootState.modifiedOn = document['x-meditor'].modifiedOn
        document['x-meditor'].modifiedOn = new Date().toISOString()
        document['x-meditor'].modifiedBy = user.uid
        // TODO: replace with actual model init state
        document['x-meditor'].states = [rootState]
        document['x-meditor'].publishedTo = []
        //! </refactor>

        const insertedDocument = await documentsDb.insertDocument(document, modelName)

        // ToDo: Review this fn and see if there's a more maintainable answer to models changing workflows.
        if (modelName === 'Models') {
            legacyHandleModelChanges(insertedDocument)
        }

        // ToDo: publish to queue service

        return [
            null,
            {
                insertedDocument,
                location: `/api/models/${modelName}/documents/${document[titleProperty]}`,
            },
        ]
    } catch (error) {
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
