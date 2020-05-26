import gql from 'graphql-tag'

export const DOCUMENT_QUERY = gql`
    query getDocument($modelName: String!, $title: String!, $version: String) {
        document(modelName: $modelName, title: $title, version: $version) {
            title
            doc
            state
            version
            modifiedBy
            modifiedOn
        }
    }
`

export const MODEL_QUERY = gql`
    query getModel($modelName: String!, $currentState: String!) {
        model(modelName: $modelName, currentState: $currentState) {
            name
            description
            icon {
                name
                color
            }
            schema
            layout
            titleProperty
            workflow {
                currentNode {
                    id
                    privileges {
                        role
                        privilege
                    }
                }
                currentEdges {
                    role
                    source
                    target
                    label
                }
            }
        }
    }
`

export const COMMENTS_QUERY = gql`
    query getComments($modelName: String!, $title: String!) {
        documentComments(modelName: $modelName, title: $title) {
            _id
            parentId
            userUid
            text
            resolved
            resolvedBy
            createdBy
            createdOn
        }
    }
`

export const HISTORY_QUERY = gql`
    query getHistory($modelName: String!, $title: String!) {
        documentHistory(modelName: $modelName, title: $title) {
            modifiedOn
            modifiedBy
            state
        }
    }
`