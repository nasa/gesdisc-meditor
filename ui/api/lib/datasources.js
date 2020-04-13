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

    async getDocumentComments(model, title) {
        return await this.get('getComments', { model, title })
    }

    async getDocumentHistory(model, title) {
        return await this.get('getDocumentHistory', { model, title })
    }

    async getWorkflow(title) {
        return (await this.getDocument('Workflows', title)).doc
    }

}

module.exports.mEditorApi = mEditorApi
