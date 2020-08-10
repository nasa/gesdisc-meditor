import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Alert from 'react-bootstrap/Alert'
import { withApollo } from '../../lib/apollo'
import SearchBar from '../../components/search/search-bar'
import SearchList from '../../components/search/search-list'
import PageTitle from '../../components/page-title'
import withAuthentication from '../../components/with-authentication'
import gql from 'graphql-tag'
import { useLazyQuery } from '@apollo/react-hooks'
import RenderResponse from '../../components/render-response'
import Loading from '../../components/loading'

interface SearchOptions {
    term: string
    filters: any
    sort: SortOptions
}

interface SortOptions {
    direction: string
    property: string
    isDate: boolean
}

const DEFAULT_SEARCH_OPTIONS = {
    term: '',
    filters: {
        state: '',
    },
    sort: {
        direction: 'desc',
        property: 'modifiedOn',
        isDate: true,
    },
}

const MODEL_DOCUMENTS_QUERY = gql`
    query getDocuments($modelName: String!, $filter: String) {
        model(modelName: $modelName) {
            name
            icon {
                name
                color
            }
            layout
            schema
        }
        documents(modelName: $modelName, filter: $filter) {
            title
            model
            modifiedBy
            modifiedOn(format: "M/dd/yyyy, h:mm a")
            state
        }
    }
`

/**
 * renders the model page with the model's documents in a searchable/filterable list
 */
const ModelPage = ({ user, model, ssrDocuments }) => {
    const router = useRouter()
    const modelName = router.query.modelName as string
    const search = router.query.search as string
    const filter = router.query.filter as string
    const sort = router.query.sort as string

    const [documents, setDocuments] = useState([])
    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        // get search term from query param OR use default
        term: search || DEFAULT_SEARCH_OPTIONS.term,

        // get search filters from URL params OR use defaults
        filters: filter ? filter.split(' AND ').reduce((obj, item) => ({
            ...obj,
            [item.split(':')[0]]: item.split(':')[1],
        }), {}) : DEFAULT_SEARCH_OPTIONS.filters,

        // get sort options from URL params or use defaults
        sort: {
            property: sort?.split(':')?.[0] || DEFAULT_SEARCH_OPTIONS.sort.property,
            direction: sort?.split(':')?.[1] || DEFAULT_SEARCH_OPTIONS.sort.direction,
            isDate: sort ? (sort?.split(':')?.[2] ? true : false) : DEFAULT_SEARCH_OPTIONS.sort.isDate,
        },
    })

    const [getDocuments, { loading, error, data }] = useLazyQuery(MODEL_DOCUMENTS_QUERY, {
        fetchPolicy: 'network-only',
    })

    const fetchedDocuments = data?.documents

    useEffect(() => {
        setDocuments(ssrDocuments)
    }, [ssrDocuments])

    useEffect(() => {
        if (!fetchedDocuments) return
        window.scrollTo(0, 0)
        setDocuments(fetchedDocuments)
    }, [fetchedDocuments])

    // when changing search term, filters, sorting, etc. modify the URL to make the options bookmarkable
    useEffect(() => {
        if (!('URLSearchParams' in window)) {
            return
        }

        let qp = new URLSearchParams(window.location.search)
        let filters = []

        // handle filters
        Object.keys(searchOptions.filters).forEach(key => {
            let value = searchOptions.filters[key]
            if (value) filters.push(`${key}:${value}`)
        })

        // add or remove query params for each search option type
        searchOptions.term ? qp.set('search', searchOptions.term) : qp.delete('search')
        filters.length ? qp.set('filter', filters.join(' AND ')) : qp.delete('filter')

        // only add sort options if they differ from the default
        if (searchOptions.sort.property !== DEFAULT_SEARCH_OPTIONS.sort.property || searchOptions.sort.direction !== DEFAULT_SEARCH_OPTIONS.sort.direction) {
            qp.set('sort', `${searchOptions.sort.property}:${searchOptions.sort.direction}`)

            if (searchOptions.sort.isDate) qp.set('sort', `${qp.get('sort')}:date`)
        } else {
            qp.delete('sort')
        }

        // setting location.search directly would cause a page refresh, instead add the change to history
        history.pushState(null, '', qp.toString() ? window.location.pathname + '?' + qp.toString() : window.location.pathname)
    }, [searchOptions])

    function addNewDocument() {
        router.push('/meditor/[modelName]/new', `/meditor/${modelName}/new`)
    }

    return (
        <div>
            <PageTitle title={modelName} />

            <SearchBar
                model={model}
                modelName={modelName}
                initialInput={searchOptions.term}
                onInput={(term) => setSearchOptions({
                    ...searchOptions,
                    term,
                })}
            />

            <div className="my-4">
                <RenderResponse
                    loading={loading}
                    error={!documents || error}
                    loadingComponent={<Loading text={`Loading documents...`} />}
                    errorComponent={
                        <Alert variant="danger">
                            <p>Failed to retrieve {modelName} documents.</p>
                            <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                        </Alert>
                    }
                >
                    {documents && (
                        <SearchList
                            documents={documents}
                            model={model}
                            onAddNew={addNewDocument}
                            user={user}
                            onRefreshList={() => {
                                getDocuments({
                                    variables: {
                                        modelName,
                                        filter,
                                    },
                                })
                            }}
                            searchOptions={searchOptions}
                            onSortChange={(sort) => {
                                setSearchOptions({
                                    ...searchOptions,
                                    sort,
                                })
                            }}
                            onFilterChange={(filter, value) => {
                                setSearchOptions({
                                    ...searchOptions,
                                    filters: {
                                        ...searchOptions.filters,
                                        [filter]: value,
                                    },
                                })
                            }}
                        />
                    )}
                </RenderResponse>
            </div>
        </div>
    )
}

ModelPage.getInitialProps = async (ctx) => {
    let response = await ctx.apolloClient.query({
        query: MODEL_DOCUMENTS_QUERY,
        variables: {
            modelName: ctx.query.modelName,
            filter: ctx.query.filter,
        },
    })

    return {
        model: response?.data?.model,
        ssrDocuments: response?.data?.documents,
    }
}

export default withApollo({ ssr: true })(withAuthentication()(ModelPage))
