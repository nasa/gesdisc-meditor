import { useQuery } from '@apollo/react-hooks'
import PageTitle from '../components/page-title'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import { withApollo } from '../lib/apollo'
import ModelIcon from '../components/model-icon'
import styles from './dashboard.module.css'
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

const DashboardPage = ({ user }) => {
    const { loading, error, data } = useQuery(MODEL_CATEGORIES_QUERY)

    if (error || loading) return <div></div>

    return (
        <div>
            <PageTitle title="" />

            {data.modelCategories.map(category => (
                <div key={category.name} className={styles.category}>
                    <h3>{category.name}</h3>

                    <div className={styles.models}>
                        {category.models.sort((a, b) => a.name.localeCompare(b.name)).map(model => (
                            <div key={model.name} className={styles.model}>
                                <Button
                                    variant="light"
                                    onClick={() => Router.push('/meditor/[modelName]', `/meditor/${model.name}`)}
                                    className="dashboard-model"
                                >
                                    <ModelIcon name={model?.icon?.name} color={model?.icon?.color} />
                                    <span>{model?.name}</span>
                                    <span>({model?.xMeditor?.count})</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default withApollo({ ssr: true })(DashboardPage)
