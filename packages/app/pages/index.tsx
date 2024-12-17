import ModelsByCategory from '../components/models-by-category'
import PageTitle from '../components/page-title'
import UnderMaintenance from '../components/under-maintenance'
import { getLoggedInUser } from 'auth/user'
import { getModelsWithDocumentCount } from '../models/service'
import { sortModels } from '../utils/sort'
import type { NextPageContext } from 'next'
import type { Model, ModelCategory } from '../models/types'

export interface DashboardPageProps {
    modelCategories: ModelCategory[]
}

const DashboardPage = ({ modelCategories }: DashboardPageProps) => {
    if (!modelCategories) {
        //? after upgrading to NextJS v15, hitting the back button to return to the homepage results in `undefined` props
        //? this is a quick fix to reload the page if we encounter that scenario, as modelCategories should never be undefined
        // TODO: figure out why NextJS v15 is not populating props correctly on back button click
        window?.location.reload()
        return null // return null to render nothing until the page refreshes
    }

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
    // Redirect to sign in page if logged out
    //? Unlike other pages, the root path, /meditor doesn't seem to react at all to NextJS middleware
    if (!(await getLoggedInUser(ctx.req, ctx.res))) {
        return {
            redirect: {
                destination: '/signin',
                permanent: false,
            },
        }
    }

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
