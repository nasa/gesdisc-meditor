import gql from 'graphql-tag'

export const MODEL_CATEGORIES_QUERY = gql`
    {
        modelCategories {
            name
            models {
                name
                icon {
                    name
                    color
                }
                xMeditor {
                    count
                }
            }
        }
    }
`