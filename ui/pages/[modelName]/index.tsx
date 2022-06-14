import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import SearchBar from '../../components/search/search-bar'
import SearchList from '../../components/search/search-list'
import PageTitle from '../../components/page-title'
import withAuthentication from '../../components/with-authentication'
import { getModel, getModels } from '../../models/model'
import { getDocumentsForModel } from '../../models/document'
import { NextPageContext } from 'next'
import { User } from '../../service/api'
import { Document, Model } from '../../models/types'
import { SearchOptions } from './types'

const DEFAULT_SEARCH_OPTIONS = {
    term: '',
    filters: {},
    sort: {
        direction: 'desc',
        property: 'x-meditor.modifiedOn',
        isDate: true,
    },
}

/**
 * given an object of search filters, turn it into a Lucene style search query
 * @param searchFilters
 */
function filtersToSearchQuery(searchFilters) {
    let filters = []

    Object.keys(searchFilters).forEach(key => {
        let value = searchFilters[key]
        if (value) filters.push(`${key}:${value}`)
    })

    return filters.join(' AND ')
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
    const search = router.query.search as string
    const filter = router.query.filter as string
    const sort = router.query.sort as string

    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        // get search term from query param OR use default
        term: search || DEFAULT_SEARCH_OPTIONS.term,

        // get search filters from URL params OR use defaults
        filters: filter
            ? filter.split(' AND ').reduce(
                  (obj, item) => ({
                      ...obj,
                      [item.split(':')[0]]: item.split(':')[1],
                  }),
                  {}
              )
            : DEFAULT_SEARCH_OPTIONS.filters,

        // get sort options from URL params or use defaults
        sort: {
            property: sort?.split(':')?.[0] || DEFAULT_SEARCH_OPTIONS.sort.property,
            direction: sort?.split(':')?.[1] || DEFAULT_SEARCH_OPTIONS.sort.direction,
            isDate: sort
                ? sort?.split(':')?.[2]
                    ? true
                    : false
                : DEFAULT_SEARCH_OPTIONS.sort.isDate,
        },
    })

    // when changing search term, filters, sorting, etc. modify the URL to make the options bookmarkable
    useEffect(() => {
        if (!('URLSearchParams' in window)) {
            return
        }

        let qp = new URLSearchParams(window.location.search)

        // add or remove query params for each search option type
        searchOptions.term
            ? qp.set('search', searchOptions.term)
            : qp.delete('search')

        let filters = filtersToSearchQuery(searchOptions.filters)
        filters ? qp.set('filter', filters) : qp.delete('filter')

        // only add sort options if they differ from the default
        if (
            searchOptions.sort.property !== DEFAULT_SEARCH_OPTIONS.sort.property ||
            searchOptions.sort.direction !== DEFAULT_SEARCH_OPTIONS.sort.direction
        ) {
            qp.set(
                'sort',
                `${searchOptions.sort.property}:${searchOptions.sort.direction}`
            )

            if (searchOptions.sort.isDate) qp.set('sort', `${qp.get('sort')}:date`)
        } else {
            qp.delete('sort')
        }

        // setting location.search directly would cause a page refresh, instead add the change to history
        history.pushState(
            null,
            '',
            qp.toString()
                ? window.location.pathname + '?' + qp.toString()
                : window.location.pathname
        )
    }, [searchOptions])

    function addNewDocument() {
        router.push('/meditor/[modelName]/new', `/meditor/${modelName}/new`)
    }

    function handleFilterChange(filter, value) {
        let newFilters = {
            ...searchOptions.filters,
            [filter]: value,
        }

        // TODO: trigger a new query!!!!!!!!
        /* 
        getDocuments({
            variables: {
                modelName,
                filter: filtersToSearchQuery(newFilters),
            },
        })*/

        // update URL params to match filter change
        setSearchOptions({
            ...searchOptions,
            filters: {
                ...newFilters,
            },
        })
    }

    return (
        <div>
            <PageTitle title={modelName} />

            <SearchBar
                allModels={allModels}
                model={model}
                modelName={modelName}
                initialInput={searchOptions.term}
                onInput={term =>
                    setSearchOptions({
                        ...searchOptions,
                        term,
                    })
                }
            />

            <div className="my-4">
                {documents && (
                    <SearchList
                        documents={documents.map(document => ({
                            ...document,
                            ...document['x-meditor'], // bring x-meditor properties up a level
                        }))}
                        model={model}
                        onAddNew={addNewDocument}
                        user={user}
                        onRefreshList={() => {
                            // TODO: WHAT TO DO ON CLONE?
                        }}
                        searchOptions={searchOptions}
                        onSortChange={sort => {
                            setSearchOptions({
                                ...searchOptions,
                                sort,
                            })
                        }}
                        onFilterChange={handleFilterChange}
                    />
                )}
            </div>
        </div>
    )
}

export async function getServerSideProps(context: NextPageContext) {
    const models = await getModels()
    const model = await getModel(context.query.modelName.toString())
    const documents = await getDocumentsForModel(context.query.modelName.toString())

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
