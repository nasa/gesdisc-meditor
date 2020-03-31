import { useQuery } from '@apollo/react-hooks'
import PageTitle from '../components/page-title'
import gql from 'graphql-tag'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import { withApollo } from '../lib/apollo'
import ModelIcon from '../components/model-icon'

const QUERY = gql`
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

const DashboardPage = () => {
    const { loading, error, data } = useQuery(QUERY)

    if (error || loading) return <div></div>

    return (
        <div>
            <PageTitle title="" />

            {data.modelCategories.map(category => (
                <div key={category.name}>
                    <h2>{category.name}</h2>
                    {category.models.map(model => (
                        <Button key={model.name} onClick={() => Router.push('/[modelName]', `/${model.name}`)}>
                            <ModelIcon name={model.icon.name} />
                            {model.name}
                        </Button>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default withApollo({ ssr: true })(DashboardPage)

