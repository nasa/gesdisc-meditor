const { GraphQLScalarType } = require('graphql')
const GraphQLJSON = require('graphql-type-json')

function sortModels(modelA, modelB) {
    if (modelA.category < modelB.category) return 1
    if (modelA.category > modelB.category) return -1

    if (modelA.category < modelB.category) return -1
    if (modelA.category > modelB.category) return 1

    return 0
}

function parseDocumentForUI(document, modelName, documentTitle) {
    try {
        document.title = documentTitle || document.title || document.doc.title
    } catch (e) {
        document.title = ''
    }

    document.model = document.model || modelName
    document.modifiedOn = document['x-meditor'].modifiedOn
    document.modifiedBy = document['x-meditor'].modifiedBy
    document.state = document['x-meditor'].state
    document.targetStates = document['x-meditor'].targetStates
    delete document['x-meditor']
    
    return document
}

module.exports = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).getTime(),
        parseLiteral: ast => ast.kind === Kind.INT ? parseInt(ast.value, 10) : null
    }),
    Query: {
        model: async (_, params, { dataSources }) => {
            return dataSources.mEditorApi.getModel(params.modelName)
        },
        models: async (_, _params, { dataSources }) => {
            return dataSources.mEditorApi.getModels()
        },
        modelCategories: async (_, _params, { dataSources }) => {
            let models = (await dataSources.mEditorApi.getModels()).sort(sortModels)

            let categories = models
                // retrieve just the category name
                .map(model => model.category)
                // remove duplicates
                .filter((category, index, categories) => categories.indexOf(category) === index)
            
            return categories.map(category => ({
                name: category,
                models: models
                    .filter(model => model.category === category)
                    .map(model => {
                        model.xMeditor = model['x-meditor']
                        return model
                    })
            }))
        },
        documents: async (_, params, { dataSources }) => {
            let documents = await dataSources.mEditorApi.getDocumentsForModel(params.modelName)
            return documents.map(document => parseDocumentForUI(document, params.modelName))
        },
        document: async (_, params, { dataSources }) => {
            let document = await dataSources.mEditorApi.getDocument(params.modelName, params.title)
            return parseDocumentForUI(document, params.modelName, params.title)
        }
    },
    JSON: GraphQLJSON.GraphQLJSON,
    JSONObject: GraphQLJSON.GraphQLJSONObject,
}
