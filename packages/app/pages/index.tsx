import type { User } from 'auth/types'
import { getLoggedInUser } from 'auth/user'
import type { NextPageContext } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import ModelIcon from '../components/model-icon'
import PageTitle from '../components/page-title'
import UnderMaintenance from '../components/under-maintenance'
import { getModelsWithDocumentCount } from '../models/service'
import type { Model, ModelCategory } from '../models/types'
import styles from './dashboard.module.css'

type DashboardPageProps = {
    modelCategories: ModelCategory[]
}
const collator = new Intl.Collator()
const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

const DashboardPage = ({ modelCategories }: DashboardPageProps) => {
    const [filterModelBy, setFilterModelBy] = useState<'hasRoles' | 'none'>(
        'hasRoles'
    )

    return (
        <main>
            <PageTitle title="" />

            {!modelCategories.length && <UnderMaintenance />}

            <article className={styles.card}>
                <details open>
                    <summary
                        className={`${styles.summary} bg-secondary text-light rounded p-1 mb-3`}
                    >
                        <h2 className="m-0">Models</h2>
                    </summary>

                    <div className={`${styles.filter} mb-3`}>
                        <label htmlFor="filter-model">Filter by:</label>
                        <select
                            id="filter-model"
                            className="form-control"
                            defaultValue={'hasRoles'}
                            onChange={e => setFilterModelBy(e.target.value as any)}
                        >
                            <option value="hasRoles">My Models</option>
                            <option value="none">All Models</option>
                        </select>
                    </div>

                    {modelCategories.map(category => {
                        if (filterModelBy === 'hasRoles' && !category.userHasRoles) {
                            return null
                        }

                        return (
                            <section className="mb-4">
                                <h3 className="d-inline mb-0 ml-1">
                                    {category.name}
                                </h3>

                                {category.models.map(model => {
                                    if (
                                        filterModelBy === 'hasRoles' &&
                                        model.userRoles.length === 0
                                    ) {
                                        return null
                                    }

                                    return (
                                        <div className="d-flex">
                                            <Link
                                                key={model.name}
                                                href={`/${model.name}`}
                                                className={styles.link}
                                            >
                                                <span className={styles.linkIcon}>
                                                    <ModelIcon
                                                        className="mr-3"
                                                        name={model?.icon?.name}
                                                        color={model?.icon?.color}
                                                    />
                                                    {`${model?.name} (${model?.count})`}
                                                </span>
                                                <span className="text-muted">
                                                    {formatter.format(
                                                        model.userRoles
                                                    )}
                                                </span>
                                            </Link>
                                        </div>
                                    )
                                })}
                            </section>
                        )
                    })}
                </details>
            </article>
        </main>
    )
}

export async function getServerSideProps({ req, res }: NextPageContext) {
    const user = await getLoggedInUser(req, res)
    // TODO: handle error when retrieving models with document count, show user an error message?
    const [_error, modelsWithDocumentCount = []] = await getModelsWithDocumentCount()

    if (!modelsWithDocumentCount.length) {
        return {
            redirect: {
                // base path is automatically applied (see next.config.js)
                destination: '/installation',
                permanent: false,
            },
        }
    }

    return {
        props: {
            modelCategories: convertModelToDisplayModel(
                getUniqueModelCategories(modelsWithDocumentCount),
                modelsWithDocumentCount,
                user
            ),
        },
    }
}

function getUniqueModelCategories(listOfModels: Model[]) {
    const uniqueModelCategories = new Set()

    for (const model of listOfModels) {
        uniqueModelCategories.add(model.category)
    }

    return Array.from(uniqueModelCategories).sort(collator.compare) as string[]
}

function convertModelToDisplayModel(
    categories: string[],
    models: Model[],
    user: User | undefined
) {
    const modelCategories = []
    const modelsByCategory = new Map<ModelCategory['name'], ModelCategory['models']>()

    categories?.forEach(category => modelsByCategory.set(category, []))

    //* Removes unused data from models; puts user's roles on each model.
    models?.forEach(({ category, ['x-meditor']: meta, icon, name }) => {
        modelsByCategory.get(category).push({
            category,
            count: meta?.count,
            icon,
            name,
            userRoles: user
                ? user.roles.reduce((accumulator, current) => {
                      if (current.model === name) {
                          accumulator.push(current.role)
                      }

                      return accumulator
                  }, [])
                : [],
        })
    })

    for (const [category, models] of modelsByCategory) {
        modelCategories.push({
            name: category,
            models: models.sort((a, b) => collator.compare(a.name, b.name)),
            userHasRoles: models.some(model => model.userRoles.length > 0),
        })
    }

    return modelCategories
}

export default DashboardPage
