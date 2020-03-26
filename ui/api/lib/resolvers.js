const GraphQLJSON = require('graphql-type-json')

function sortModels(modelA, modelB) {
    if (modelA.category < modelB.category) return 1
    if (modelA.category > modelB.category) return -1

    if (modelA.category < modelB.category) return -1
    if (modelA.category > modelB.category) return 1

    return 0
}

module.exports = {
    Query: {
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
                models: models.filter(model => model.category === category)
            }))
        },
        documents: async (_, params, { dataSources }) => {
            let documents = await dataSources.mEditorApi.getDocumentsForModel(params.modelName)

            documents.map(document => {
                document.modifiedOn = document['x-meditor'].modifiedOn
                document.modifiedBy = document['x-meditor'].modifiedBy
                document.state = document['x-meditor'].state
                document.targetStates = document['x-meditor'].targetStates
                delete document['x-meditor']

                return document
            })

            return documents
        }
    },
    JSON: GraphQLJSON.GraphQLJSON,
    JSONObject: GraphQLJSON.GraphQLJSONObject,
}
