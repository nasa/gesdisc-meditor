import gql from 'graphql-tag'

export const MODEL_DOCUMENTS_QUERY = gql`
    query getDocuments($modelName: String!) {
        model(modelName: $modelName) {
            name
            icon {
                name
                color
            }
        }
        documents(modelName: $modelName) {
            title
            model
            modifiedBy
            modifiedOn(format: "M/dd/yyyy, h:mm a")
            state
        }
    }
`
