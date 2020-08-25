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

const DashboardPage = ({ modelCategories }) => {
    return (
        <div>
            <PageTitle title="" />

            {modelCategories?.map(category => (
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

DashboardPage.getInitialProps = async (ctx) => {
    let modelCategories

    try {
        let response = await ctx.apolloClient.query({
            query: MODEL_CATEGORIES_QUERY,
        })

        modelCategories = response.data.modelCategories
    } catch (err) {
        if (err?.graphQLErrors?.[0].extensions?.response?.status == 404) {
            console.log('Models have not been setup yet! Sending user to installation page')
            
            // database hasn't been setup yet, redirect to installation page!
            ctx.res.writeHead(301, {
                Location: '/meditor/installation',
            })
        } else {
            // something else went wrong, redirect to the maintenance page
            ctx.res.writeHead(301, {
                Location: '/meditor/maintenance',
            })
        }

        ctx.res.end()
    }

    return {
        modelCategories,
    }
}

export default withApollo({ ssr: true })(DashboardPage)
