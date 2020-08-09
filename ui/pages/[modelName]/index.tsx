import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../components/app-store'
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
    const { modelName, filter } = router.query
    const { searchTerm, setSearchTerm } = useContext(AppContext)
    const [documents, setDocuments] = useState([])

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

    function addNewDocument() {
        router.push('/meditor/[modelName]/new', `/meditor/${modelName}/new`)
    }

    return (
        <div>
            <PageTitle title={modelName} />

            <SearchBar
                model={model}
                modelName={modelName}
                initialInput={searchTerm}
                onInput={(searchTerm) => setSearchTerm(searchTerm)}
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
