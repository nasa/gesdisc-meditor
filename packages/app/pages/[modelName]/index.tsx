import type { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import PageTitle from '../../components/page-title'
import SearchBar from '../../components/search/search-bar'
import SearchList from '../../components/search/search-list'
import withAuthentication from '../../components/with-authentication'
import { getDocumentsForModel } from '../../documents/service'
import type { Document } from '../../documents/types'
import { getModels, getModelWithWorkflow } from '../../models/service'
import type { Model, ModelWithWorkflow } from '../../models/types'
import type { User } from '../../auth/types'
import { isNotFoundError } from 'utils/errors'
import { format } from 'date-fns'
import Link from 'next/link'
import DocumentStateBadge from 'components/document/document-state-badge'
import { SearchTable } from '@/components/search/search-table'
import { getColumns } from '@/components/search/search-columns'

type ModelPageProps = {
    user: User
    model: ModelWithWorkflow
    allModels: Model[]
    documents: Document[]
}

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const ModelPage = (props: ModelPageProps) => {
    const router = useRouter()
    const modelName = router.query.modelName as string

    const [searchTerm, setSearchTerm] = useState('')

    function addNewDocument() {
        router.push('/[modelName]/new', `/${modelName}/new`)
    }

    function handleSortChange(newSort) {
        console.log(newSort)

        // TODO: alter URL to change search
        /*
        setSearchOptions({
            ...searchOptions,
            sort: newSort,
        })*/
    }

    function handleFilterChange(newFilter) {
        // TODO: alter URL to change search
        /*
        setSearchOptions({
            ...searchOptions,
            filter: newFilter,
        })
        */
    }

    return (
        <div>
            <PageTitle title={modelName} />

            <SearchBar
                allModels={props.allModels}
                model={props.model}
                modelName={modelName}
                onInput={setSearchTerm}
            />

            <div className="my-4">
                {props.documents === null ? (
                    <p className="text-center py-4 text-danger">
                        mEditor had an error getting documents for{' '}
                        {props.model?.name || 'this model'}. Please verify that your{' '}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://en.wikipedia.org/wiki/Query_string"
                        >
                            query parameters
                        </a>{' '}
                        are correct and try refreshing the page. mEditor has recorded
                        the error, but you can still leave feedback using the link at
                        the top of the page.
                    </p>
                ) : (
                    <>
                        <SearchTable
                            columns={getColumns(modelName)}
                            data={props.documents}
                        />

                        <SearchList
                            documents={props.documents.map(document => ({
                                ...document,
                                ...document['x-meditor'], // bring x-meditor properties up a level
                            }))}
                            model={props.model}
                            onAddNew={addNewDocument}
                            user={props.user}
                            onSortChange={handleSortChange}
                            onFilterChange={handleFilterChange}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export async function getServerSideProps(ctx: NextPageContext) {
    ctx.res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )

    const modelName = ctx.query.modelName.toString()

    const [_modelsError, allModels] = await getModels() // TODO: handle getModels error?
    const [modelError, model] = await getModelWithWorkflow(modelName)

    if (isNotFoundError(modelError)) {
        return {
            notFound: true,
        }
    }

    // fetch documents, applying search, filter, or sort
    const [documentsError, documents] = await getDocumentsForModel(modelName)

    const props = {
        allModels,
        model,
        documents: !!documentsError ? null : documents,
    }

    return { props }
}

export default withAuthentication()(ModelPage)
