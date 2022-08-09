import gql from 'graphql-tag'
import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../../components/app-store'
import { useLazyQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { withApollo } from '../../../lib/apollo'
import PageTitle from '../../../components/page-title'
import DocumentForm from '../../../components/document/form'
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
import JsonDiffViewer from '../../../components/json-diff-viewer'
import { useLocalStorage } from '../../../lib/use-localstorage.hook'
import cloneDeep from 'lodash.clonedeep'
import DocumentWorkflow from '../../../components/document/document-workflow'

export type DocumentPanels = 'comments' | 'history' | 'source' | 'workflow'

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

const EditDocumentPage = ({ user, version = null, theme }) => {
    const router = useRouter()
    const params = router.query
    const documentTitle = urlDecode(params.documentTitle as string)
    // todo: this seems like a security concern; any way to sanitize against injection / allowlist models?
    const modelName = params.modelName as string

    const [form, setForm] = useState(null)
    const [formData, setFormData] = useState(null)
    const [activePanel, setActivePanel] = useLocalStorage<DocumentPanels>(
        'documentEditActivePanel',
        null
    )
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

        if (!modelResponse.data) {
            loadModel({
                variables: {
                    modelName,
                    currentState: documentResponse.data.document.state,
                },
            })
        }

        reloadComments()
        if (!historyResponse.data) {
            loadHistory({
                variables: {
                    modelName,
                    title: documentTitle,
                },
            })
        }
    }, [documentResponse.data])

    useEffect(() => {
        setTreeifiedComments(treeify(commentsResponse?.data?.documentComments))
    }, [commentsResponse.data])

    const currentPrivileges = modelResponse?.data?.model?.workflow
        ? user.privilegesForModelAndWorkflowNode(
              modelName,
              modelResponse.data.model.workflow.currentNode
          )
        : []

    function reloadDocument() {
        const parser = new URL(window.location.href)
        parser.searchParams.set('reload', 'true')
        window.location.href = parser.href
    }

    function loadDocumentVersion(version) {
        loadDocument({
            variables: { modelName, title: documentTitle, version },
        })

        getOldAndNewVersion(version)
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
        const { _id, ...document } = formData.doc
        delete document['x-meditor'] // x-meditor metadata, shouldn't be there but ensure it isn't

        await fetch(
            `/meditor/api/changeDocumentState?model=${modelName}&title=${documentTitle}&state=${state}&version=${documentResponse.data.document.version}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // only allow updating the document during a state change if the user has edit privileges
                    // this leaves it up to the workflow to determine whether updating via state change is allowed
                    ...(currentPrivileges?.includes('edit') && document),
                }),
            }
        )

        state == 'Deleted'
            ? router.push('/[modelName]', `/${modelName}`)
            : reloadDocument()
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

    useEffect(() => {
        if (historyResponse.data) {
            getOldAndNewVersion(documentTitle)
        }
    }, [historyResponse.data])

    const [currentVersion, setCurrentVersion] = useState(null)
    const [oldVersion, setOldVersion] = useState(null)

    function getOldAndNewVersion(version) {
        const listOfHistory = historyResponse.data.documentHistory
        const currentIndex = listOfHistory.findIndex(
            item => item.modifiedOn === version
        )
        const siblingIndex =
            currentIndex + 1 === listOfHistory.length
                ? currentIndex
                : currentIndex + 1
        const previousVersion = listOfHistory[siblingIndex].modifiedOn

        setOldVersion(previousVersion)
        setCurrentVersion(version)
    }

    const [toggleJSON, setToggleJSON] = useState(false)

    function versionSelected(modifiedOn) {
        setOldVersion(modifiedOn)
    }

    function toggleJsonDiffer() {
        getOldAndNewVersion(historyResponse.data.documentHistory[0].modifiedOn)
        setToggleJSON(!toggleJSON)
    }

    const workflowShouldShow =
        modelResponse.data?.model?.name?.toLowerCase() === 'workflows'

    return (
        <div>
            <PageTitle title={[documentTitle, modelName]} />

            {theme !== 'edpub' && (
                <Breadcrumbs>
                    <Breadcrumb
                        title={modelName}
                        href="/[modelName]"
                        as={`/${modelName}`}
                    />
                    <Breadcrumb title={documentTitle} />
                </Breadcrumbs>
            )}

            <DocumentHeader
                activePanel={activePanel}
                isJsonPanelOpen={toggleJSON}
                document={documentResponse?.data?.document}
                model={modelResponse?.data?.model}
                version={version}
                togglePanelOpen={togglePanel}
                toggleJsonDiffer={toggleJsonDiffer}
                privileges={currentPrivileges}
                comments={commentsResponse?.data?.documentComments}
                history={historyResponse?.data?.documentHistory}
            />

            <div
                className={styles.stage}
                style={{ paddingRight: activePanel ? 450 : 0 }}
            >
                {currentVersion && oldVersion && toggleJSON && (
                    <div className={styles.jsonDiffView}>
                        <JsonDiffViewer
                            onVersionSelected={versionSelected}
                            history={historyResponse?.data?.documentHistory}
                            currentVersion={currentVersion}
                            oldVersion={oldVersion}
                            documentTitle={documentTitle}
                            modelName={modelName}
                        />
                    </div>
                )}
                <DocumentForm
                    model={modelResponse?.data?.model}
                    document={formData}
                    onUpdateForm={setForm}
                    onChange={handleSourceChange}
                    readOnly={!currentPrivileges?.includes('edit')}
                />

                <DocumentPanel
                    title="Comments"
                    open={activePanel == 'comments'}
                    onClose={closePanel}
                >
                    <DocumentComments
                        user={user}
                        comments={treeifiedComments}
                        saveComment={saveComment}
                        resolveComment={resolveComment}
                    />
                </DocumentPanel>

                <DocumentPanel
                    title="History"
                    open={activePanel == 'history'}
                    onClose={closePanel}
                >
                    <DocumentHistory
                        history={historyResponse?.data?.documentHistory}
                        onVersionChange={loadDocumentVersion}
                        onJSONDiffChange={() => setToggleJSON(!toggleJSON)}
                        showJSONView={toggleJSON}
                    />
                </DocumentPanel>

                <DocumentPanel
                    title="JSONEditor"
                    open={activePanel == 'source'}
                    onClose={closePanel}
                >
                    <SourceDialog
                        source={formData}
                        title={documentTitle}
                        onChange={handleSourceChange}
                    />
                </DocumentPanel>

                <DocumentPanel
                    onClose={closePanel}
                    open={activePanel == 'workflow' && workflowShouldShow}
                    title="Workflow"
                >
                    {workflowShouldShow && (
                        <DocumentWorkflow workflow={formData?.doc} />
                    )}
                </DocumentPanel>
            </div>

            <FormActions
                privileges={currentPrivileges}
                form={form}
                formData={formData}
                onSave={saveDocument}
                onUpdateState={updateDocumentState}
                actions={modelResponse?.data?.model?.workflow?.currentEdges}
                showActions={
                    documentResponse?.data?.document?.targetStates?.length > 0
                }
                confirmUnsavedChanges={true}
            />
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication()(EditDocumentPage))
