import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../../components/app-store'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../../lib/apollo'
import Alert from 'react-bootstrap/Alert'
import RenderResponse from '../../../components/render-response'
import Loading from '../../../components/loading'
import PageTitle from '../../../components/page-title'
import Form from '../../../components/form'
import { Breadcrumbs, Breadcrumb } from '../../../components/breadcrumbs'
import DocumentHeader from '../../../components/document-header'
import DocumentPanel from '../../../components/document-panel'
import DocumentComments from '../../../components/document-comments'
import DocumentHistory from '../../../components/document-history'
import withAuthentication from '../../../components/with-authentication'
import FormActions from '../../../components/form-actions'
import mEditorApi from '../../../service/'
import styles from './document-edit.module.css'

const DOCUMENT_QUERY = gql`
    query getDocument($modelName: String!, $title: String!) {
        document(modelName: $modelName, title: $title) {
            title
            doc
            state
            version
            modifiedBy
            modifiedOn
        }
    }
`

const MODEL_QUERY = gql`
    query getModel($modelName: String!, $currentState: String!) {
        model(modelName: $modelName, currentState: $currentState) {
            name
            description
            icon {
                name
                color
            }
            schema
            layout
            titleProperty
            workflow {
                currentNode {
                    id
                    privileges {
                        role
                        privilege
                    }
                }
                currentEdges {
                    role
                    source
                    target
                    label
                }
            }
        }
    }
`

const COMMENTS_QUERY = gql`
    query getComments($modelName: String!, $title: String!) {
        documentComments(modelName: $modelName, title: $title) {
            _id
            parentId
            userUid
            text
            resolved
            resolvedBy
            createdBy
            createdOn
        }
    }
`

const HISTORY_QUERY = gql`
    query getHistory($modelName: String!, $title: String!) {
        documentHistory(modelName: $modelName, title: $title) {
            modifiedOn
            modifiedBy
            state
        }
    }
`

const EditDocumentPage = ({ user }) => {
    const router = useRouter()
    const params = router.query
    const documentTitle = params.documentTitle as string
    const modelName = params.modelName as string

    const [form, setForm] = useState(null)
    const [commentsOpen, setCommentsOpen] = useState(false)
    const [historyOpen, setHistoryOpen] = useState(true)
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const documentResponse = useQuery(DOCUMENT_QUERY, {
        variables: { modelName, title: documentTitle },
        fetchPolicy: 'network-only',
    })

    const [loadModel, modelResponse] = useLazyQuery(MODEL_QUERY, {
        fetchPolicy: 'network-only',
    })

    const [loadComments, commentsResponse] = useLazyQuery(COMMENTS_QUERY, {
        fetchPolicy: 'network-only',
    })

    const [loadHistory, historyResponse] = useLazyQuery(HISTORY_QUERY, {
        fetchPolicy: 'network-only',
    })

    useEffect(() => {
        if (!documentResponse.data) return

        loadModel({
            variables: {
                modelName,
                currentState: documentResponse.data.document.state,
            },
        })

        loadComments({
            variables: {
                modelName,
                title: documentTitle,
            },
        })

        loadHistory({
            variables: {
                modelName,
                title: documentTitle,
            },
        })
    }, [documentResponse.data])

    useEffect(() => {
        if (commentsOpen) setHistoryOpen(false)
    }, [commentsOpen])

    useEffect(() => {
        if (historyOpen) setCommentsOpen(false)
    }, [historyOpen])

    const currentPrivileges = modelResponse?.data?.model?.workflow
        ? user.privilegesForModelAndWorkflowNode(modelName, modelResponse.data.model.workflow.currentNode)
        : []

    function reloadDocument() {
        location.reload()
    }

    async function saveDocument(document) {
        delete document._id
        delete document.banTransitions
        document['x-meditor'] = {}
        document['x-meditor'].model = modelName

        let documentBlob = new Blob([JSON.stringify(document)])

        try {
            await mEditorApi.putDocument(documentBlob)

            setSuccessNotification('Successfully updated the document')
            reloadDocument()
        } catch (err) {
            console.error('Failed to create document ', err)
            setErrorNotification('Failed to create the document')
        }
    }

    async function updateDocumentState(state) {
        await mEditorApi.changeDocumentState(modelName, documentTitle, state, documentResponse.data.version)
        reloadDocument()
    }

    return (
        <div>
            <PageTitle title={[documentTitle, modelName]} />

            <Breadcrumbs>
                <Breadcrumb title={modelName} href="/[modelName]" as={`/${modelName}`} />
                <Breadcrumb title={documentTitle} />
            </Breadcrumbs>

            <DocumentHeader
                document={documentResponse?.data?.document}
                model={modelResponse?.data?.model}
                toggleCommentsOpen={() => setCommentsOpen(!commentsOpen)}
                toggleHistoryOpen={() => setHistoryOpen(!historyOpen)}
                privileges={currentPrivileges}
                comments={commentsResponse?.data?.documentComments}
                history={historyResponse?.data?.documentHistory}
            />

            <RenderResponse
                loading={documentResponse.loading}
                error={documentResponse.error}
                loadingComponent={<Loading text={`Loading...`} />}
                errorComponent={
                    <Alert variant="danger">
                        <p>Failed to retrieve document: {documentTitle}</p>
                        <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                        <p>If the error continues to occur, please open a support ticket.</p>
                    </Alert>
                }
            >
                <div className={styles.stage} style={{ paddingRight: (commentsOpen || historyOpen) ? 430 : 0 }}>
                    <Form
                        model={modelResponse?.data?.model}
                        document={documentResponse?.data?.document}
                        onUpdateForm={setForm}
                    />

                    <DocumentPanel title="Comments" open={commentsOpen} onClose={() => setCommentsOpen(false)}>
                        <DocumentComments comments={commentsResponse?.data?.documentComments} />
                    </DocumentPanel>

                    <DocumentPanel title="History" open={historyOpen} onClose={() => setHistoryOpen(false)}>
                        <DocumentHistory history={historyResponse?.data?.documentHistory} onVersionChange={(version) => console.log('change to version ', version)} />
                    </DocumentPanel>
                </div>

                <FormActions
                    privileges={currentPrivileges}
                    form={form}
                    onSave={saveDocument}
                    onUpdateState={updateDocumentState}
                    actions={modelResponse?.data?.model?.workflow?.currentEdges}
                />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(EditDocumentPage))
