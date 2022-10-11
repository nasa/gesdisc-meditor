const { RESTDataSource } = require('apollo-datasource-rest')

class mEditorApi extends RESTDataSource {
    constructor() {
        super()

        let isTest = false

        if (typeof window !== 'undefined') {
            isTest =
                window.location.origin.indexOf('uat.gesdisc.eosdis.nasa.gov') >= 0
        } else {
            isTest =
                process.env.APP_URL &&
                process.env.APP_URL.indexOf('uat.gesdisc.eosdis.nasa.gov') >= 0
        }

        this.baseURL = `http://${
            isTest ? 'meditor_test_server' : 'meditor_server'
        }:8081/meditor/api`
    }

    getCookiesHeaderValue() {
        let cookies = this.context.cookies
        return Object.keys(cookies)
            .map(key => `${key}=${cookies[key]}`)
            .join(';')
    }

    willSendRequest(request) {
        if ('cookies' in this.context) {
            request.headers.set('Cookie', this.getCookiesHeaderValue())
        }
    }

    async getModel(name) {
        return await this.get('getModel', { name })
    }

    async getDocument(model, title) {
        return await this.get('getDocument', { model, title })
    }

    async getDocumentVersion(model, title, version) {
        return await this.get('getDocument', { model, title, version })
    }

    async getDocumentHistory(model, title) {
        return await this.get('getDocumentHistory', { model, title })
    }

    async getWorkflow(title) {
        return await this.getDocument('Workflows', title)
    }
}

module.exports.mEditorApi = mEditorApi
