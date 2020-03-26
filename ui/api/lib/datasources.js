const { RESTDataSource } = require('apollo-datasource-rest')

class mEditorApi extends RESTDataSource {

    constructor() {
        super()
        this.baseURL = 'http://meditor_server:8081/meditor/api'
    }

    async getModels(model) {
        return await this.get('listModels')
    }

    async getDocumentsForModel(model) {
        return await this.get('listDocuments', { model })
    }

}

module.exports.mEditorApi = mEditorApi
