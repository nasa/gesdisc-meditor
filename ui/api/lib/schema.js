const { gql } = require('apollo-server')

const typeDefs = gql`
    directive @date(
        defaultFormat: String = "mmmm d, yyyy"
    ) on FIELD_DEFINITION

    scalar Date
    scalar JSON
    scalar JSONObject

    type Query {
        modelCategories: [ModelCategory!]!
        models: [Model!]!
        model(modelName: String!, currentState: String): Model!
        documents(modelName: String!): [Document!]!
        document(modelName: String!, title: String!, version: String): Document!
        documentComments(modelName: String!, title: String!): [Comment]!
        documentHistory(modelName: String!, title: String!): [History]!
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
        version: String
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
        currentNode: WorkflowNode!
        currentEdges: [WorkflowEdge]!
    }

    type History {
        modifiedOn: String!
        modifiedBy: String!
        state: String!
    }

    type Comment {
        _id: String!
        parentId: String!
        documentId: String!
        userUid: String!
        text: String!
        model: String
        version: String
        resolved: Boolean
        resolvedBy: String
        createdBy: String
        createdOn: String
    }
`

module.exports = typeDefs
