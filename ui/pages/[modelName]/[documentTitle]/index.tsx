import gql from 'graphql-tag'
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
import SourceDialog from '../../../components/document/source-dialog'
import withAuthentication from '../../../components/with-authentication'
import FormActions from '../../../components/document/form-actions'
import mEditorApi from '../../../service/'
import styles from './document-edit.module.css'
import { treeify } from '../../../lib/treeify'
import { urlDecode } from '../../../lib/url'
import { useLocalStorage } from '../../../lib/use-localstorage.hook'
import cloneDeep from 'lodash.clonedeep'

const DOCUMENT_QUERY = gql`
    query getDocument($modelName: String!, $title: String!, $version: String) {
        document(modelName: $modelName, title: $title, version: $version) {
            title
            doc
            state
            version
            modifiedBy
            modifiedOn
            targetStates
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
            states {
                source
                target
                modifiedBy
                modifiedOn(format: "M/dd/yyyy, h:mm a")
            }
        }
    }
`

const EditDocumentPage = ({ user, version = null }) => {
    const router = useRouter()
    const params = router.query
    const documentTitle = urlDecode(params.documentTitle as string)
    const modelName = params.modelName as string

    const [form, setForm] = useState(null)
    const [formData, setFormData] = useState(null)
    const [activePanel, setActivePanel] = useLocalStorage('documentEditActivePanel', null)
    const [treeifiedComments, setTreeifiedComments] = useState([])
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
        state == 'Deleted' ? router.push('/meditor/[modelName]', `/meditor/${modelName}`) : reloadDocument()
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

    function togglePanel(panel) {
        setActivePanel(panel === activePanel ? null : panel)
    }

    function closePanel() {
        setActivePanel(null)
    }

    function handleSourceChange(newSource) {
        let formData = cloneDeep(documentResponse.data.document)

        newSource._id = formData.doc._id
        formData.doc = newSource.doc || newSource

        setFormData(formData)
    }

    return (
        <div>
            <PageTitle title={[documentTitle, modelName]} />

            <Breadcrumbs>
                <Breadcrumb title={modelName} href="/meditor/[modelName]" as={`/meditor/${modelName}`} />
                <Breadcrumb title={documentTitle} />
            </Breadcrumbs>

            <DocumentHeader
                document={documentResponse?.data?.document}
                model={modelResponse?.data?.model}
                version={version}
                togglePanelOpen={togglePanel}
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
                <div className={styles.stage} style={{ paddingRight: activePanel ? 430 : 0 }}>
                    <Form
                        model={modelResponse?.data?.model}
                        document={formData}
                        onUpdateForm={setForm}
                        onChange={handleSourceChange}
                        readOnly={!(currentPrivileges?.includes('edit'))}
                    />

                    <DocumentPanel title="Comments" open={activePanel == 'comments'} onClose={closePanel}>
                        <DocumentComments
                            user={user}
                            comments={treeifiedComments}
                            saveComment={saveComment}
                            resolveComment={resolveComment}
                        />
                    </DocumentPanel>

                    <DocumentPanel title="History" open={activePanel == 'history'} onClose={closePanel}>
                        <DocumentHistory history={historyResponse?.data?.documentHistory} onVersionChange={loadDocumentVersion} />
                    </DocumentPanel>

                    <DocumentPanel title="JSONEditor" open={activePanel == 'source'} onClose={closePanel} large={true}>
                        <SourceDialog source={formData} title={documentTitle} onChange={handleSourceChange} />
                    </DocumentPanel>
                </div>

                <FormActions
                    privileges={currentPrivileges}
                    form={form}
                    formData={formData}
                    onSave={saveDocument}
                    onUpdateState={updateDocumentState}
                    actions={modelResponse?.data?.model?.workflow?.currentEdges}
                    showActions={documentResponse?.data?.document?.targetStates?.length > 0}
                    confirmUnsavedChanges={true}
                />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication()(EditDocumentPage))
