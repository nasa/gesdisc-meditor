import { useQuery } from '@apollo/react-hooks'
import PageTitle from '../components/page-title'
import gql from 'graphql-tag'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import { withApollo } from '../lib/apollo'
import ModelIcon from '../components/model-icon'
import styles from './dashboard.module.css'

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
                xMeditor {
                    count
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
                <div key={category.name} className={styles.category}>
                    <h3>{category.name}</h3>

                    <div className={styles.models}>
                        {category.models.map(model => (
                            <div className={styles.model}>
                                <Button
                                    variant="light"
                                    key={model.name}
                                    onClick={() => Router.push('/[modelName]', `/${model.name}`)}
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
