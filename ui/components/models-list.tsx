import { useQuery } from '@apollo/react-hooks'
import Router from 'next/router'
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
                        <Button key={model.name} onClick={() => Router.push('/[modelName]', `/${model.name}`)}>
                            <Icon name={model.icon.name} />
                            {model.name}
                        </Button>
                    ))}
                </div>
            ))}
        </>
    )
}

export default ModelsList
