import type { NextPageContext } from 'next'
import ModelsByCategory from '../components/models-by-category'
import PageTitle from '../components/page-title'
import UnderMaintenance from '../components/under-maintenance'
import { getModelsWithDocumentCount } from '../models/service'
import type { Model, ModelCategory } from '../models/types'
import { sortModels } from '../utils/sort'

export interface DashboardPageProps {
    modelCategories: ModelCategory[]
}

const DashboardPage = ({ modelCategories }: DashboardPageProps) => {
    return (
        <div>
            <PageTitle title="" />

            {(!modelCategories || modelCategories.length < 0) && <UnderMaintenance />}

            <ModelsByCategory modelCategories={modelCategories} />
        </div>
    )
}

export function sortModelsIntoCategories(models: Model[]): ModelCategory[] {
    // get a unique list of category names from the models
    const categories: string[] = models
        .map(model => model.category) // retrieve just the category name
        .filter(
            (category, index, categories) => categories.indexOf(category) === index
        ) // remove duplicates

    return categories.map(category => ({
        name: category,
        models: models.filter(model => model.category === category),
    }))
}

export async function getServerSideProps(ctx: NextPageContext) {
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

    const modelCategories = sortModelsIntoCategories(models)

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
