import PageTitle from '../components/page-title'
import UnderMaintenance from '../components/under-maintenance'
import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import ModelIcon from '../components/model-icon'
import styles from './dashboard.module.css'
import { getModelsWithDocumentCount } from '../models/model'
import type { ModelCategory } from '../models/types'
import { NextPageContext } from 'next'
import { sortModels } from '../utils/sort'

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
    const models = (await getModelsWithDocumentCount()).sort(sortModels)

    if (!models.length) {
        // database hasn't been setup yet, redirect to installation page!
        context.res.writeHead(301, {
            Location: '/meditor/installation',
        })

        context.res.end()
    }

    // get a unique list of category names from the models
    const categories: string[] = models
        .map(model => model.category) // retrieve just the category name
        .filter(
            (category, index, categories) => categories.indexOf(category) === index
        ) // remove duplicates

    const modelCategories: ModelCategory[] = categories.map(category => ({
        name: category,
        models: models.filter(model => model.category === category),
    }))

    return {
        // Next doesn't know how to process the Mongo _id property, as it's an object, not a string. So this hack parses ahead of time
        // https://github.com/vercel/next.js/issues/11993
        // TODO: review the above issue for solutions
        props: JSON.parse(
            JSON.stringify({
                modelCategories,
            })
        ),
    }
}

export default DashboardPage
