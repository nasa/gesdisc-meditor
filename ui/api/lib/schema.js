const { gql } = require('apollo-server')

const typeDefs = gql`
    directive @date(
        defaultFormat: String = "mmmm d, yyyy"
    ) on FIELD_DEFINITION

    scalar Date
    scalar JSON
    scalar JSONObject

    type Query {
        modelCategories: [ModelCategory!]! @cacheControl(maxAge: 10)
        models: [Model!]! @cacheControl(maxAge: 10)
        model(modelName: String!): Model! @cacheControl(maxAge: 10)
        documents(modelName: String!): [Document!]! @cacheControl(maxAge: 10)
        document(modelName: String!, title: String!): Document! @cacheControl(maxAge: 10)
    }

    type ModelIcon {
        name: String
        color: String
    }

    type ModelMeta {
        model: String!
        title: String!
        modifiedOn: Date! @date
        modifiedBy: String!
        count: String!
        states: [WorkflowState!]!
    }

    type ModelCategory {
        name: String
        models: [Model!]!
    }

    type Model {
        name: String
        description: String
        category: String
        workflow: Workflow
        icon: ModelIcon
        xMeditor: ModelMeta
        schema: String
        layout: String
        titleProperty: String
        documentation: String
        tag: [String!]!
        documents: [Document!]!
    }

    type Document {
        title: String
        model: String
        doc: JSONObject
        modifiedOn: Date @date
        modifiedBy: String
        state: String
        states: [WorkflowState]
        targetStates: [String]
    }

    type WorkflowState {
        source: String!
        target: String!
        modifiedOn: Date! @date
    }

    type WorkflowPrivilege {
        role: String
        privilege: [String]
    }

    type WorkflowNode {
        id: String!
        privileges: [WorkflowPrivilege]
    }

    type WorkflowEdge {
        role: String
        source: String
        target: String
        label: String
        notify: Boolean
    }

    type Workflow {
        name: String!
        roles: [String]!
        nodes: [WorkflowNode]!
        edges: [WorkflowEdge]!
        currentEdges: [WorkflowEdge]!
    }
`

module.exports = typeDefs
