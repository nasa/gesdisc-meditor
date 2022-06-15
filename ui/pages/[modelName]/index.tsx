import { useRouter } from 'next/router'
import SearchList from '../../components/search/search-list'
import SearchBar from '../../components/search/search-bar'
import PageTitle from '../../components/page-title'
import withAuthentication from '../../components/with-authentication'
import { getModel, getModels } from '../../models/model'
import { getDocumentsForModel } from '../../models/document'
import { NextPageContext } from 'next'
import { User } from '../../service/api'
import { Document, DocumentsSearchOptions, Model } from '../../models/types'
import { ParsedUrlQuery } from 'querystring'
import { useEffect, useRef, useState } from 'react'

function getSearchOptionsFromParams(query: ParsedUrlQuery): DocumentsSearchOptions {
    return {
        filter: query.filter?.toString() || '',
        sort: query.sort?.toString() || '',
        searchTerm: query.searchTerm?.toString() || '',
    }
}

interface ModelPageProps {
    user: User
    model: Model
    allModels: Model[]
    documents: Document[]
}

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const ModelPage = ({ user, model, allModels, documents }: ModelPageProps) => {
    const router = useRouter()
    const modelName = router.query.modelName as string
    const [searchOptions, setSearchOptions] = useState<DocumentsSearchOptions>(
        getSearchOptionsFromParams(router.query)
    )

    // use SSR documents on initial load, searching does a fetch
    const [fetchedDocuments, setFetchedDocuments] = useState<Document[]>(documents)

    const isFirstRun = useRef(true)
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false
            return
        }

        console.log(JSON.stringify(searchOptions))

        refetchDocuments(searchOptions)
    }, [searchOptions])

    async function refetchDocuments(searchOptions: DocumentsSearchOptions) {
        const queryParams = new URLSearchParams({
            ...searchOptions,
            model: modelName,
        }).toString()

        const response = await fetch('/meditor/api/listDocuments?' + queryParams)
        const documents = (await response.json()) as Document[]

        console.log('new documents ', documents.length)

        setFetchedDocuments(documents)
    }

    function addNewDocument() {
        router.push('/meditor/[modelName]/new', `/meditor/${modelName}/new`)
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
                {fetchedDocuments && (
                    <SearchList
                        documents={fetchedDocuments.map(document => ({
                            ...document,
                            ...document['x-meditor'], // bring x-meditor properties up a level
                        }))}
                        model={model}
                        onAddNew={addNewDocument}
                        user={user}
                        onRefreshList={() => {
                            // TODO: WHAT TO DO ON CLONE?
                            // refetch using current search options
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
    const models = await getModels()
    const model = await getModel(ctx.query.modelName.toString())

    // gather query params
    const modelName = ctx.query.modelName.toString()
    const searchOptions = getSearchOptionsFromParams(ctx.query)

    // fetch documents, applying search, filter, or sort
    const documents = await getDocumentsForModel(modelName, searchOptions)

    return {
        // see note in /pages/index.tsx for parse/stringify explanation
        props: JSON.parse(
            JSON.stringify({
                allModels: models,
                model,
                documents,
            })
        ),
    }
}

export default withAuthentication()(ModelPage)
