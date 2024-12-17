import PageTitle from '../../components/page-title'
import SearchBar from '../../components/search/search-bar'
import SearchList from '../../components/search/search-list'
import { getDocumentsForModel } from '../../documents/service'
import { getModels, getModelWithWorkflow } from '../../models/service'
import { NotFound } from 'http-errors'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import type { NextPageContext } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import type { Document } from '../../documents/types'
import type {
    DocumentsSearchOptions,
    Model,
    ModelWithWorkflow,
} from '../../models/types'

function getSearchOptionsFromParams(query: ParsedUrlQuery): DocumentsSearchOptions {
    return {
        filter: query.filter?.toString() || '',
        sort: query.sort?.toString() || '',
        searchTerm: query.searchTerm?.toString() || '',
    }
}

function getParamsFromSearchOptions(
    searchOptions: DocumentsSearchOptions
): URLSearchParams {
    // remove empty items so we don't pollute the URL with empty params
    const usedSearchOptions = Object.fromEntries(
        Object.entries(searchOptions).filter(([_, v]) => v != null && v != '')
    )

    return new URLSearchParams({ ...usedSearchOptions })
}

interface ModelPageProps {
    model: ModelWithWorkflow
    allModels: Model[]
    documents: Document[]
}

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const ModelPage = ({ model, allModels, documents }: ModelPageProps) => {
    const router = useRouter()
    const modelName = router.query.modelName as string
    const [searchOptions, setSearchOptions] = useState<DocumentsSearchOptions>(
        getSearchOptionsFromParams(router.query)
    )

    const isFirstRun = useRef(true)
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false
            return
        }

        refetchDocuments(searchOptions)
    }, [searchOptions])

    async function refetchDocuments(searchOptions: DocumentsSearchOptions) {
        const queryParams = getParamsFromSearchOptions(searchOptions).toString()

        router.push(`/${modelName}${queryParams && '?' + queryParams}`)
    }

    function addNewDocument() {
        router.push('/[modelName]/new', `/${modelName}/new`)
    }

    function handleSortChange(newSort) {
        if (newSort == searchOptions.sort) return // don't update state if sort hasn't changed

        setSearchOptions({
            ...searchOptions,
            sort: newSort,
        })
    }

    function handleFilterChange(newFilter) {
        if (newFilter == searchOptions.filter) return // don't update filter if it hasn't changed

        setSearchOptions({
            ...searchOptions,
            filter: newFilter,
        })
    }

    function handleSearchChange(newSearchTerm: string) {
        if (newSearchTerm == searchOptions.searchTerm) return // don't update state if search term hasn't changed

        setSearchOptions({
            ...searchOptions,
            searchTerm: newSearchTerm,
        })
    }

    return (
        <div>
            <PageTitle title={modelName} />

            <SearchBar
                allModels={allModels}
                model={model}
                modelName={modelName}
                initialInput={searchOptions.searchTerm}
                onInput={handleSearchChange}
            />

            <div className="my-4">
                {documents === null ? (
                    <p className="text-center py-4 text-danger">
                        mEditor had an error getting documents for{' '}
                        {model?.name || 'this model'}. Please verify that your{' '}
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
                    <SearchList
                        documents={documents.map(document => ({
                            ...document,
                            ...document['x-meditor'], // bring x-meditor properties up a level
                        }))}
                        model={model}
                        onAddNew={addNewDocument}
                        onRefreshList={() => {
                            refetchDocuments(searchOptions) // refetch using current search options
                        }}
                        searchOptions={searchOptions}
                        onSortChange={handleSortChange}
                        onFilterChange={handleFilterChange}
                    />
                )}
            </div>
        </div>
    )
}

export async function getServerSideProps(ctx: NextPageContext) {
    const modelName = ctx.query.modelName.toString()

    const [_modelsError, allModels] = await getModels() // TODO: handle getModels error?
    const [modelError, model] = await getModelWithWorkflow(modelName)

    if (modelError instanceof NotFound) {
        return {
            notFound: true,
        }
    }

    const searchOptions = getSearchOptionsFromParams(ctx.query)

    // fetch documents, applying search, filter, or sort
    const [documentsError, documents] = await getDocumentsForModel(
        modelName,
        searchOptions
    )

    const props = {
        allModels,
        model,
        documents: !!documentsError ? null : documents,
    }

    return { props }
}

export default ModelPage
