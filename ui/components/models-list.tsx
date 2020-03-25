import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Button from 'react-bootstrap/Button'
import Icon from './icon'

export const QUERY = gql`
    {
        modelCategories {
            name
            models {
                name
                icon {
                    name
                    color
                }
            }
        }
    }
`

const ModelsList = () => {
    const { loading, error, data } = useQuery(QUERY)

    if (error || loading) return <div></div>

    return (
        <>
            {data.modelCategories.map(category => (
                <div key={category.name}>
                    <h2>{category.name}</h2>
                    {category.models.map(model => (
                        <ModelButton key={model.name} name={model.name} icon={model.icon.name} />
                    ))}
                </div>
            ))}
        </>
    )
}

const ModelButton = ({ name, icon }) => {
    return (
        <Button key={name}>
            <Icon name={icon} />
            {name}
        </Button>
    )
}

export default ModelsList
