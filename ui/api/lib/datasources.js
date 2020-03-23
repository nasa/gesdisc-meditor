const { RESTDataSource } = require('apollo-datasource-rest')

class mEditorApi extends RESTDataSource {

    constructor() {
        super()
        this.baseURL = 'http://meditor_server:8081/meditor/api'
    }

    async getModels(model) {
        return await this.get('listModels')
    }

}

module.exports.mEditorApi = mEditorApi
