import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import PageTitle from '../components/page-title'
import gql from 'graphql-tag'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import { withApollo } from '../lib/apollo'
import ModelIcon from '../components/model-icon'
import LoginDialog from '../components/login-dialog'
import styles from './dashboard.module.css'
import withAuthentication from '../components/with-authentication'

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

const DashboardPage = ({ user }) => {
    const { loading, error, data } = useQuery(QUERY)
    const { query } = useRouter()

    if (query) localStorage.setItem('redirectUrl', JSON.stringify(query))

    if (error || loading) return <div></div>

    return (
        <div>
            <PageTitle title="" />

            {data.modelCategories.map(category => (
                <div key={category.name} className={styles.category}>
                    <h3>{category.name}</h3>

                    <div className={styles.models}>
                        {category.models.map(model => (
                            <div key={model.name} className={styles.model}>
                                <Button
                                    variant="light"
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

            <LoginDialog show={!user} />
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(DashboardPage))
