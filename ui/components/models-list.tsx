import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

export const MODELS_QUERY = gql`
    {
        models {
            name
            icon {
                name
                color
            }
        }
    }
`

const ModelsList = () => {
    const { loading, error, data } = useQuery(MODELS_QUERY)

    if (error) return <div>Error</div>
    if (loading) return <div>Loading</div>

    return (
        <section>
            <ul>
                {data.models.map((model, index) => (
                    <li key={index}>
                        {model.name}
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default ModelsList
