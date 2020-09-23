const { GraphQLScalarType } = require('graphql')
const GraphQLJSON = require('graphql-type-json')
const jsonMapper = require('json-mapper-json')
const clonedeep = require('lodash.clonedeep')
require('portable-fetch')

function sortModels(modelA, modelB) {
    if (modelA.category < modelB.category) return 1
    if (modelA.category > modelB.category) return -1

    if (modelA.category < modelB.category) return -1
    if (modelA.category > modelB.category) return 1

    return 0
}

function findInitialEdges(edges) {
    if (!edges) return []

    // get list of workflow targets (["Draft", "Under Review", "Published"])
    const targets = edges.map((edge) => edge.target)

    // only return edges whose source does not exist in any other edges target
    // aka, the initial edges for the workflow
    return edges.filter((edge) => !targets.includes(edge.source))
}

function getDocumentMap(modelName, documentTitle) {
    return {
        title: {
            path: '$item',
            required: false,
            formatting: (document) => {
                try {
                    return (documentTitle || document.title)
                        .replace(/&lt;/gi, '<')
                        .replace(/&gt;/gi, '>')
                } catch (err) {
                    return ''
                }
            },
        },
        model: {
            path: 'model',
            required: false,
            formatting: (model) => model || modelName,
        },
        doc: {
            path: 'doc',
            required: false,
        },
        modifiedOn: {
            path: 'x-meditor.modifiedOn',
            required: false,
        },
        modifiedBy: {
            path: 'x-meditor.modifiedBy',
            required: false,
        },
        state: {
            path: 'x-meditor.state',
            required: false,
        },
        states: {
            path: 'x-meditor.states',
            required: false,
        },
        targetStates: {
            path: 'x-meditor.targetStates',
            required: false,
        },
        publicationStatus: {
            path: 'x-meditor.publishedTo',
            required: false,
        },
        version: {
            path: '$item',
            required: false,
            formatting: (document) => {
                let modifiedOn = document['x-meditor'].modifiedOn

                if (modifiedOn) modifiedOn = modifiedOn.toString()

                return document.version || modifiedOn
            },
        },
    }
}

module.exports = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue: (value) => new Date(value),
        serialize: (value) => new Date(value).getTime(),
        parseLiteral: (ast) => (ast.kind === Kind.INT ? parseInt(ast.value, 10) : null),
    }),
    Query: {
        model: async (_, params, { dataSources }) => {
            let model = await dataSources.mEditorApi.getModel(params.modelName)

            model.workflow = await dataSources.mEditorApi.getWorkflow(model.workflow)

            if (params.currentState) {
                model.workflow.currentNode = model.workflow.nodes.find((node) => node.id === params.currentState)
                model.workflow.currentEdges = model.workflow.edges.filter((edge) => edge.source === params.currentState)
            } else {
                model.workflow.currentNode = model.workflow.nodes[0]
                model.workflow.currentEdges = findInitialEdges(model.workflow.edges)
            }

            return model
        },
        models: async (_, _params, { dataSources }) => {
            return dataSources.mEditorApi.getModels()
        },
        modelCategories: async (_, _params, { dataSources }) => {
            let models = (await dataSources.mEditorApi.getModels()).sort(sortModels)

            let categories = models
                // retrieve just the category name
                .map((model) => model.category)
                // remove duplicates
                .filter((category, index, categories) => categories.indexOf(category) === index)

            return categories.map((category) => ({
                name: category,
                models: models
                    .filter((model) => model.category === category)
                    .map((model) => {
                        model.xMeditor = model['x-meditor']
                        return model
                    }),
            }))
        },
        documents: async (_, params, { dataSources }) => {
            let documents = await dataSources.mEditorApi.getDocumentsForModel(params.modelName, params.filter)
            return await jsonMapper(documents, getDocumentMap(params.modelName))
        },
        document: async (_, params, { dataSources }) => {
            let document

            if (params.version) {
                document = await dataSources.mEditorApi.getDocumentVersion(
                    params.modelName,
                    params.title,
                    params.version
                )
            } else {
                document = await dataSources.mEditorApi.getDocument(params.modelName, params.title)
            }

            // the original API response had a separate "doc" property
            // we'll put it back to reduce complexity in resolving GraphQL responses
            let doc = clonedeep(document)
            let meta = clonedeep(document['x-meditor'])
            delete doc['x-meditor']
            document = {
                'x-meditor': meta,
                doc,
            }

            return await jsonMapper(document, getDocumentMap(params.modelName, params.title))
        },
        documentComments: async (_, params, { dataSources }) => {
            return dataSources.mEditorApi.getDocumentComments(params.modelName, params.title)
        },
        documentHistory: async (_, params, { dataSources }) => {
            return dataSources.mEditorApi.getDocumentHistory(params.modelName, params.title)
        },
        validLink: async (_, { url }) => {
            try {
                let regex = new RegExp(
                    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
                )

                if (!url || !url.match(regex)) {
                    throw new Error('Invalid URL')
                }

                let response = await fetch(url, {
                    method: 'HEAD',
                })

                if (response.status >= 400) {
                    throw new Error('Bad response from server')
                }

                return {
                    isValid: true,
                    message: 'Valid URL',
                }
            } catch (err) {
                return {
                    isValid: false,
                    message: err.message || 'Invalid URL',
                }
            }
        },
    },
    JSON: GraphQLJSON.GraphQLJSON,
    JSONObject: GraphQLJSON.GraphQLJSONObject,
}
