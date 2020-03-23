const { gql } = require('apollo-server')

const typeDefs = gql`
    type Query {
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
        meta: ModelMeta
        schema: String
        layout: String
        titleProperty: String
        documentation: String
        tag: [String!]!
    }
`

module.exports = typeDefs
