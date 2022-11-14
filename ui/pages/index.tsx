import type { NextPageContext } from 'next'
import Link from 'next/link'
import Button from 'react-bootstrap/Button'
import ModelIcon from '../components/model-icon'
import PageTitle from '../components/page-title'
import UnderMaintenance from '../components/under-maintenance'
import { getModelsWithDocumentCount } from '../models/service'
import type { ModelCategory } from '../models/types'
import { sortModels } from '../utils/sort'
import styles from './dashboard.module.css'

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
                                    <Link href={`/${model.name}`}>
                                        <Button
                                            variant="light"
                                            className="dashboard-model"
                                        >
                                            <ModelIcon
                                                name={model?.icon?.name}
                                                color={model?.icon?.color}
                                            />
                                            <span>{model?.name}</span>
                                            <span>
                                                ({model?.['x-meditor']?.count})
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export async function getServerSideProps(context: NextPageContext) {
    // TODO: handle error when retrieving models with document count, show user an error message?
    const [_error, modelsWithDocumentCount] = await getModelsWithDocumentCount()
    const models = (modelsWithDocumentCount || []).sort(sortModels)

    if (!models.length) {
        return {
            redirect: {
                // base path is automatically applied (see next.config.js)
                destination: '/installation',
                permanent: false,
            },
        }
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
        props: modelCategories,
    }
}

export default DashboardPage
