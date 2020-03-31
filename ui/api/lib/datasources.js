const { RESTDataSource } = require('apollo-datasource-rest')

class mEditorApi extends RESTDataSource {

    constructor() {
        super()
        this.baseURL = 'http://meditor_server:8081/meditor/api'
    }

    async getModel(name) {
        return await this.get('getModel', { name })
    }

    async getModels() {
        return await this.get('listModels')
    }

    async getDocumentsForModel(model) {
        return await this.get('listDocuments', { model })
    }

    async getDocument(model, title) {
        return await this.get('getDocument', { model, title })
    }

}

module.exports.mEditorApi = mEditorApi
