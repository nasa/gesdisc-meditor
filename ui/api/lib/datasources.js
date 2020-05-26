const { RESTDataSource } = require('apollo-datasource-rest')

class mEditorApi extends RESTDataSource {

    constructor() {
        super()

        // TODO: do this with environment files instead
        let isTest = false

        if (typeof window !== 'undefined') {
            isTest = window.location.origin.indexOf('uat.gesdisc.eosdis.nasa.gov') >= 0
        } else {
            isTest = process.env.APP_URL.indexOf('uat.gesdisc.eosdis.nasa.gov') >= 0
        }

        this.baseURL = `http://${isTest ? 'meditor_test_server' : 'meditor_server'}:8081/meditor/api`

        console.log('using baseURL ', this.baseURL)
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

    async getDocumentVersion(model, title, version) {
        return await this.get('getDocument', { model, title, version })
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
