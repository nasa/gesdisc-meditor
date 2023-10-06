import { getLoggedInUser } from 'auth/service'
import {
    convertModelToDisplayModel,
    getModelsAccessibleByUser,
    getRecentDocumentsFromModels,
    getUniqueModelCategories,
} from 'dashboard/service'
import type { Document } from 'documents/types'
import type { NextPageContext } from 'next'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import ModelIcon from '../components/model-icon'
import PageTitle from '../components/page-title'
import UnderMaintenance from '../components/under-maintenance'
import { getModelsWithDocumentCount } from '../models/service'
import type { ModelCategory } from '../models/types'
import styles from './dashboard.module.css'

type DashboardPageProps = {
    modelCategories: ModelCategory[]
    userRecentDocuments: Document[]
}
const listFormatter = new Intl.ListFormat('en-US', {
    style: 'long',
    type: 'conjunction',
})
const timeFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

const DashboardPage = ({
    modelCategories,
    userRecentDocuments,
}: DashboardPageProps) => {
    const userIconMap = useMemo(
        () =>
            modelCategories.reduce((accumulator, current) => {
                current.models.forEach(model => {
                    accumulator[model.name] = model.icon
                })

                return accumulator
            }, {}),
        [modelCategories]
    )
    const userDocumentStates = useMemo(() => {
        const uniqueDocumentStates = new Set<string>()

        for (const document of userRecentDocuments) {
            uniqueDocumentStates.add(document['x-meditor'].state)
        }

        return Array.from(uniqueDocumentStates).sort()
    }, [userRecentDocuments])

    const [filterModelBy, setFilterModelBy] = useState<'hasRoles' | 'none'>(
        'hasRoles'
    )
    const [filterDocumentBy, setFilterDocumentBy] = useState<string>(
        userDocumentStates.find(string => string === 'Under Review') ||
            userDocumentStates[0]
    )

    return (
        <main>
            <PageTitle title="" />

            {!modelCategories.length && <UnderMaintenance />}

            <article className={`${styles.card} rounded shadow-sm`}>
                <details open className={styles.details}>
                    <summary
                        className={`${styles.summary} bg-secondary text-light rounded-top p-1 mb-3`}
                    >
                        <h2 className="h4 m-0 ml-1">{`Recent Documents: ${filterDocumentBy}`}</h2>
                    </summary>

                    <div className={`${styles.filter} mb-3`}>
                        <label htmlFor="filter-document-state">Filter by:</label>
                        <select
                            id="filter-document-state"
                            className="form-control"
                            defaultValue={filterDocumentBy}
                            onChange={e => setFilterDocumentBy(e.target.value)}
                        >
                            {userDocumentStates.map((state: string) => (
                                <option value={state} key={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                    </div>

                    {userRecentDocuments.map(document => {
                        const { title, ['x-meditor']: meta } = document
                        const { model, modifiedOn, state } = meta

                        if (state !== filterDocumentBy) {
                            return null
                        }

                        return (
                            <div className="d-flex" key={title}>
                                <Link
                                    href={`/${globalThis.encodeURIComponent(
                                        model
                                    )}/${globalThis.encodeURIComponent(title)}`}
                                    className={styles.link}
                                >
                                    <span className={styles.linkIcon}>
                                        <ModelIcon
                                            className="mr-3"
                                            name={userIconMap[model].name}
                                            color={userIconMap[model].color}
                                        />
                                        {title}
                                    </span>
                                    <span className={`text-muted ${styles.linkInfo}`}>
                                        {timeFormatter.format(new Date(modifiedOn))}
                                    </span>
                                </Link>
                            </div>
                        )
                    })}
                </details>
            </article>

            <article className={`${styles.card} rounded shadow-sm`}>
                <details open className={styles.details}>
                    <summary
                        className={`${styles.summary} bg-secondary text-light rounded-top p-1 mb-3`}
                    >
                        <h2 className="h4 m-0 ml-1">{`${
                            filterModelBy === 'hasRoles' ? 'My Models' : 'All Models'
                        }`}</h2>
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
                            <section className="mb-4" key={category.name}>
                                <h3 className="h4 d-inline mb-0 ml-1">
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
                                        <div className="d-flex" key={model.name}>
                                            <Link
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
                                                    {listFormatter.format(
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
            userRecentDocuments: await getRecentDocumentsFromModels(
                await getModelsAccessibleByUser(req, res)
            ),
        },
    }
}

export default DashboardPage
