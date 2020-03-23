module.exports = {
    Query: {
        models: async (_, _params, { dataSources }) => {
            return dataSources.mEditorApi.getModels()
        },
    },
}
