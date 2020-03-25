const { gql } = require('apollo-server')

const typeDefs = gql`
    type Query {
        modelCategories: [ModelCategory!]! @cacheControl(maxAge: 10)
        models: [Model!]! @cacheControl(maxAge: 10)
    }

    type ModelIcon {
        name: String
        color: String
    }

    type ModelMeta {
        model: String!
        title: String!
        modifiedOn: String!
        modifiedBy: String!
        count: String!
        states: [WorkflowState!]!
    }

    type ModelCategory {
        name: String
        models: [Model!]!
    }

    type WorkflowState {
        source: String!
        target: String!
        modifiedOn: String!
    }

    type Model {
        name: String
        description: String
        category: String
        workflow: String
        icon: ModelIcon
        xMeditor: ModelMeta
        schema: String
        layout: String
        titleProperty: String
        documentation: String
        tag: [String!]!
    }
`

module.exports = typeDefs
