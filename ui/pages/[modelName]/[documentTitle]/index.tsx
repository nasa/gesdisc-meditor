import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../../components/app-store'
import { useLazyQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { withApollo } from '../../../lib/apollo'
import Alert from 'react-bootstrap/Alert'
import RenderResponse from '../../../components/render-response'
import Loading from '../../../components/loading'
import PageTitle from '../../../components/page-title'
import Form from '../../../components/document/form'
import { Breadcrumbs, Breadcrumb } from '../../../components/breadcrumbs'
import DocumentHeader from '../../../components/document/document-header'
import DocumentPanel from '../../../components/document/document-panel'
import DocumentComments from '../../../components/document/document-comments'
import DocumentHistory from '../../../components/document/document-history'
import withAuthentication from '../../../components/with-authentication'
import FormActions from '../../../components/document/form-actions'
import mEditorApi from '../../../service/'
import styles from './document-edit.module.css'
import { treeify } from '../../../lib/treeify'
import { DOCUMENT_QUERY, MODEL_QUERY, COMMENTS_QUERY, HISTORY_QUERY } from './queries'

const EditDocumentPage = ({ user, version = null }) => {
    const router = useRouter()
    const params = router.query
    const documentTitle = params.documentTitle as string
    const modelName = params.modelName as string

    const [form, setForm] = useState(null)
    const [formData, setFormData] = useState(null)
    const [commentsOpen, setCommentsOpen] = useState(false)
    const [treeifiedComments, setTreeifiedComments] = useState([])
    const [historyOpen, setHistoryOpen] = useState(false)
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const [loadDocument, documentResponse] = useLazyQuery(DOCUMENT_QUERY, {
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
        loadDocument({
            variables: {
                modelName,
                title: documentTitle,
                version,
            },
        })
    }, [])

    useEffect(() => {
        if (!documentResponse.data) return

        setFormData(documentResponse.data.document)

        loadModel({
            variables: {
                modelName,
                currentState: documentResponse.data.document.state,
            },
        })

        reloadComments()

        loadHistory({
            variables: {
                modelName,
                title: documentTitle,
            },
        })
    }, [documentResponse.data])

    useEffect(() => {
        setTreeifiedComments(treeify(commentsResponse?.data?.documentComments))
    }, [commentsResponse.data])

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

    function loadDocumentVersion(version) {
        loadDocument({
            variables: { modelName, title: documentTitle, version }
        })
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

    async function reloadComments() {
        loadComments({
            variables: {
                modelName,
                title: documentTitle,
            },
        })
    }

    async function saveComment(comment) {
        if (!('_id' in comment)) {
            comment.documentId = documentTitle
            comment.model = modelName
            comment.version = documentResponse.data.document.version

            // TODO: move to the API
            comment.createdBy = user.firstName + ' ' + user.lastName
            comment.userUid = user.uid

            const commentBlob = new Blob([JSON.stringify(comment)])

            await mEditorApi.postComment(commentBlob)
        } else {
            await mEditorApi.editComment(comment._id, comment.text)
        }

        reloadComments()
    }

    async function resolveComment(comment) {
        await mEditorApi.resolveComment(comment._id, user.uid)
        reloadComments()
    }

    function onChange(formData: any) {
        setFormData(formData)
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
                <div className={styles.stage} style={{ paddingRight: commentsOpen || historyOpen ? 430 : 0 }}>
                    <Form
                        model={modelResponse?.data?.model}
                        document={formData}
                        onUpdateForm={setForm}
                        onChange={onChange}
                    />

                    <DocumentPanel title="Comments" open={commentsOpen} onClose={() => setCommentsOpen(false)}>
                        <DocumentComments
                            user={user}
                            comments={treeifiedComments}
                            saveComment={saveComment}
                            resolveComment={resolveComment}
                        />
                    </DocumentPanel>

                    <DocumentPanel title="History" open={historyOpen} onClose={() => setHistoryOpen(false)}>
                        <DocumentHistory history={historyResponse?.data?.documentHistory} onVersionChange={loadDocumentVersion} />
                    </DocumentPanel>
                </div>

                <FormActions
                    privileges={currentPrivileges}
                    form={form}
                    formData={formData}
                    onSave={saveDocument}
                    onUpdateState={updateDocumentState}
                    actions={modelResponse?.data?.model?.workflow?.currentEdges}
                />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(EditDocumentPage))
