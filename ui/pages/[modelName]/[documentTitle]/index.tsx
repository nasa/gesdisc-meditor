import cloneDeep from 'lodash.clonedeep'
import type { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { getLoggedInUser } from '../../../auth/user'
import { getCommentsForDocument } from '../../../comments/service'
import type { DocumentComment } from '../../../comments/types'
import { AppContext } from '../../../components/app-store'
import { Breadcrumb, Breadcrumbs } from '../../../components/breadcrumbs'
import DocumentComments from '../../../components/document/document-comments'
import DocumentHeader from '../../../components/document/document-header'
import DocumentHistory from '../../../components/document/document-history'
import DocumentPanel from '../../../components/document/document-panel'
import DocumentWorkflow from '../../../components/document/document-workflow'
import DocumentForm from '../../../components/document/form'
import FormActions from '../../../components/document/form-actions'
import SourceDialog from '../../../components/document/source-dialog'
import JsonDiffViewer from '../../../components/json-diff-viewer'
import PageTitle from '../../../components/page-title'
import withAuthentication from '../../../components/with-authentication'
import { adaptDocumentToLegacyDocument } from '../../../documents/adapters'
import { fetchDocument } from '../../../documents/http'
import { getDocument, getDocumentHistory } from '../../../documents/service'
import type {
    DocumentHistory as History,
    LegacyDocumentWithMetadata,
} from '../../../documents/types'
import { refreshDataInPlace } from '../../../lib/next'
import { treeify } from '../../../lib/treeify'
import { useLocalStorage } from '../../../lib/use-localstorage.hook'
import { getModelWithWorkflow } from '../../../models/service'
import type { ModelWithWorkflow } from '../../../models/types'
import mEditorApi from '../../../service/'
import styles from './document-edit.module.css'

export type DocumentPanels = 'comments' | 'history' | 'source' | 'workflow'

type PropsType = {
    comments: DocumentComment[]
    documentHistory: History[]
    pageDocument: LegacyDocumentWithMetadata
    model: ModelWithWorkflow
    theme: any
    user: any
    version: string
}

const EditDocumentPage = ({
    model,
    user,
    version = null,
    theme,
    comments,
    documentHistory,
    pageDocument,
}: PropsType) => {
    const router = useRouter()
    const params = router.query
    const documentTitle = decodeURIComponent(params.documentTitle as string)
    const modelName = params.modelName as string

    const [currentVersion, setCurrentVersion] = useState(null)
    const [form, setForm] = useState(null)
    const [formData, setFormData] = useState(pageDocument)
    const [oldVersion, setOldVersion] = useState(null)
    const [toggleJSON, setToggleJSON] = useState(false)
    // todo: remove this hack when this page is refactored
    const [sourceChangeBlock, setSourceChangeBlock] = useState(false)

    const [activePanel, setActivePanel] = useLocalStorage<DocumentPanels>(
        'documentEditActivePanel',
        null
    )
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    useEffect(() => {
        refreshDataInPlace(router)
    }, [formData.state, refreshDataInPlace])

    const currentPrivileges = model.workflow
        ? user.privilegesForModelAndWorkflowNode(
              modelName,
              model.workflow.currentNode
          )
        : []

    function reloadDocument() {
        const parser = new URL(window.location.href)
        parser.searchParams.set('reload', 'true')
        window.location.href = parser.href
    }

    async function loadDocumentVersion(version: string) {
        if (formData.modifiedOn === version) {
            return
        }

        // todo: decide on appropriate action for versioned document error
        const [versionedDocumentError, versionedDocument] = await fetchDocument(
            documentTitle,
            modelName,
            version
        )

        setSourceChangeBlock(true)

        setFormData(adaptDocumentToLegacyDocument(versionedDocument))

        setTimeout(() => {
            setSourceChangeBlock(false)
        }, 1000)

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
            `/meditor/api/changeDocumentState?model=${modelName}&title=${documentTitle}&state=${state}&version=${formData.version}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },

                // only allow updating the document during a state change if the user has edit privileges
                // this leaves it up to the workflow to determine whether updating via state change is allowed
                ...(currentPrivileges?.includes('edit') &&
                    document && { body: JSON.stringify(document) }),
            }
        )

        state == 'Deleted'
            ? router.push('/[modelName]', `/${modelName}`)
            : reloadDocument()
    }

    async function handleSaveComment(comment) {
        if (!('_id' in comment)) {
            await createComment(comment)
        } else {
            await updateComment(comment)
        }

        refreshDataInPlace(router)
    }

    async function createComment(comment) {
        const commentsApiUrl = `/meditor/api/models/${encodeURIComponent(
            modelName
        )}/documents/${encodeURIComponent(documentTitle)}/comments`

        return fetch(commentsApiUrl, {
            method: 'POST',
            body: JSON.stringify(comment),
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async function updateComment(comment) {
        const commentsApiUrl = `/meditor/api/models/${encodeURIComponent(
            modelName
        )}/documents/${encodeURIComponent(documentTitle)}/comments/${comment._id}`

        return fetch(commentsApiUrl, {
            method: 'PUT',
            body: JSON.stringify(comment),
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async function resolveComment(comment) {
        await updateComment({ _id: comment._id, resolved: true })

        refreshDataInPlace(router)
    }

    function togglePanel(panel) {
        setActivePanel(panel === activePanel ? null : panel)
    }

    function closePanel() {
        setActivePanel(null)
    }

    //* For updating formData when the user updates the document. Also triggers on document load and version change (hence sourceChangeBlock).
    function handleSourceChange(newSource: any) {
        if (sourceChangeBlock) {
            return
        }

        //* Get current document for its metadata.
        const formDataLocal: LegacyDocumentWithMetadata = cloneDeep(formData)

        formDataLocal.doc = newSource
        //* Updating the existing document, so reuse the DB's id.
        formDataLocal.doc._id = formData.doc._id

        setFormData(formDataLocal)
    }

    function getOldAndNewVersion(version: string) {
        const currentIndex = documentHistory?.findIndex(
            item => item.modifiedOn === version
        )
        const siblingIndex =
            currentIndex + 1 === documentHistory?.length
                ? currentIndex
                : currentIndex + 1
        const previousVersion = documentHistory[siblingIndex].modifiedOn

        setOldVersion(previousVersion)
        setCurrentVersion(version)
    }

    function versionSelected(modifiedOn) {
        setOldVersion(modifiedOn)
    }

    function toggleJsonDiffer() {
        getOldAndNewVersion(documentHistory[0]?.modifiedOn)
        setToggleJSON(!toggleJSON)
    }

    const workflowShouldShow = model.name?.toLowerCase() === 'workflows'

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
                document={formData}
                model={model}
                version={version}
                togglePanelOpen={togglePanel}
                toggleJsonDiffer={toggleJsonDiffer}
                privileges={currentPrivileges}
                comments={comments}
                history={documentHistory}
            />

            <div
                className={styles.stage}
                style={{ paddingRight: activePanel ? 450 : 0 }}
            >
                {currentVersion && oldVersion && toggleJSON && (
                    <div className={styles.jsonDiffView}>
                        <JsonDiffViewer
                            onVersionSelected={versionSelected}
                            history={documentHistory}
                            currentVersion={currentVersion}
                            oldVersion={oldVersion}
                            documentTitle={documentTitle}
                            modelName={modelName}
                        />
                    </div>
                )}

                {model && formData && (
                    <DocumentForm
                        model={model}
                        document={formData}
                        onUpdateForm={setForm}
                        onChange={handleSourceChange}
                        readOnly={!currentPrivileges?.includes('edit')}
                        allowValidationErrors={
                            model.workflow.currentNode.allowValidationErrors
                        }
                    />
                )}

                <DocumentPanel
                    title="Comments"
                    open={activePanel == 'comments'}
                    onClose={closePanel}
                >
                    <DocumentComments
                        user={user}
                        comments={comments}
                        saveComment={handleSaveComment}
                        resolveComment={resolveComment}
                    />
                </DocumentPanel>

                <DocumentPanel
                    title="History"
                    open={activePanel == 'history'}
                    onClose={closePanel}
                >
                    <DocumentHistory
                        history={documentHistory}
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
                actions={model.workflow.currentEdges}
                showActions={formData.targetStates?.length > 0}
                confirmUnsavedChanges={true}
                allowValidationErrors={
                    model.workflow.currentNode.allowValidationErrors
                }
            />
        </div>
    )
}

export async function getServerSideProps(ctx: NextPageContext) {
    const { documentTitle, modelName } = ctx.query
    const { req, res } = ctx
    const user = await getLoggedInUser(req, res)

    const [pageDocumentError, pageDocument] = await getDocument(
        decodeURIComponent(documentTitle.toString()),
        decodeURIComponent(modelName.toString()),
        user
    )

    // No point in displaying the page if our core resource has errored or is missing.
    if (pageDocumentError || !Object.keys(pageDocument).length) {
        return { notFound: true }
    }

    // TODO: handle an error retrieving the model
    const [modelError, modelWithWorkflow] = await getModelWithWorkflow(
        modelName.toString()
    )

    const [commentsError, comments] = await getCommentsForDocument(
        decodeURIComponent(documentTitle.toString()),
        decodeURIComponent(modelName.toString())
    )

    const [documentHistoryError, documentHistory] = await getDocumentHistory(
        decodeURIComponent(documentTitle.toString()),
        decodeURIComponent(modelName.toString())
    )

    const props = {
        comments: !!commentsError ? null : treeify(comments),
        pageDocument: adaptDocumentToLegacyDocument(pageDocument),
        documentHistory: !!documentHistoryError ? null : documentHistory,
        modelWithWorkflow,
    }

    return { props }
}

export default withAuthentication()(EditDocumentPage)
