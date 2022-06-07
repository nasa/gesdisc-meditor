import PageTitle from '../components/page-title'
import UnderMaintenance from '../components/under-maintenance'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import ModelIcon from '../components/model-icon'
import styles from './dashboard.module.css'
import { getModelCategories } from '../models/model'
import type { ModelCategory } from '../models/model'
import { NextPageContext } from 'next'

type DashboardPageProps = {
    modelCategories: ModelCategory[]
}

const DashboardPage = ({ modelCategories }: DashboardPageProps) => {
    return (
        <div>
            <PageTitle title="" />

            {(!modelCategories || modelCategories.length < 0) && <UnderMaintenance />}

            {modelCategories?.map(category => (
                <div key={category.name} className={styles.category}>
                    <h3>{category.name}</h3>

                    <div className={styles.models}>
                        {category.models
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(model => (
                                <div key={model.name} className={styles.model}>
                                    <Button
                                        variant="light"
                                        onClick={() =>
                                            Router.push(
                                                '/meditor/[modelName]',
                                                `/meditor/${model.name}`
                                            )
                                        }
                                        className="dashboard-model"
                                    >
                                        <ModelIcon
                                            name={model?.icon?.name}
                                            color={model?.icon?.color}
                                        />
                                        <span>{model?.name}</span>
                                        <span>({model?.['x-meditor']?.count})</span>
                                    </Button>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export async function getServerSideProps(context: NextPageContext) {
    const modelCategories = await getModelCategories()

    if (!modelCategories?.length) {
        // database hasn't been setup yet, redirect to installation page!
        context.res.writeHead(301, {
            Location: '/meditor/installation',
        })

        context.res.end()
    }

    return {
        props: {
            modelCategories: JSON.parse(JSON.stringify(modelCategories)), // TODO: fix this hack
        },
    }
}

export default DashboardPage
