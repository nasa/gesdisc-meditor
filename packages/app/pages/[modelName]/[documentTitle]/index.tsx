import cloneDeep from 'lodash.clonedeep'
import DocumentComments from '../../../components/document/document-comments'
import DocumentForm from '../../../components/document/form'
import DocumentHeader from '../../../components/document/document-header'
import DocumentHistory from '../../../components/document/document-history'
import DocumentPanel from '../../../components/document/document-panel'
import DocumentWorkflow from '../../../components/document/document-workflow'
import FormActions from '../../../components/document/form-actions'
import JsonDiffViewer from '../../../components/json-diff-viewer'
import PageTitle from '../../../components/page-title'
import SourceDialog from '../../../components/document/source-dialog'
import styles from './document-edit.module.css'
import { adaptDocumentToLegacyDocument } from '../../../documents/adapters'
import { AppContext } from '../../../components/app-store'
import { Breadcrumb, Breadcrumbs } from '../../../components/breadcrumbs'
import { getCommentsForDocument } from '../../../comments/service'
import { getDocument, getDocumentHistory } from '../../../documents/service'
import { getModelWithWorkflow } from '../../../models/service'
import { getServerSession } from '../../../auth/user'
import { privilegesForModelAndWorkflowNode } from 'auth/utilities'
import { refreshDataInPlace } from '../../../lib/next'
import { treeify } from '../../../lib/treeify'
import { useContext, useEffect, useState } from 'react'
import { useLocalStorage } from '../../../lib/use-localstorage.hook'
import { useRouter } from 'next/router'
import type { NextPageContext } from 'next'
import type { DocumentComment } from '../../../comments/types'
import {
    createDocument as httpCreateDocument,
    fetchDocument,
} from '../../../documents/http'
import type {
    DocumentHistory as History,
    LegacyDocumentWithMetadata,
} from '../../../documents/types'
import type { ModelWithWorkflow } from '../../../models/types'

export type DocumentPanels = 'comments' | 'history' | 'source' | 'workflow'

type PropsType = {
    comments: DocumentComment[]
    documentHistory: History[]
    pageDocument: LegacyDocumentWithMetadata
    model: ModelWithWorkflow
    theme: any
    version: string
    currentPrivileges: any[]
}

const EditDocumentPage = ({
    model,
    version = null,
    theme,
    comments,
    documentHistory,
    pageDocument,
    currentPrivileges,
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

        const [error, _createdDocument] = await httpCreateDocument(
            document,
            modelName
        )

        if (error) {
            setErrorNotification(error.message ?? 'Failed to update the document')
            return
        }

        setSuccessNotification('Successfully updated the document')

        reloadDocument()
    }

    async function updateDocumentState(state) {
        const { _id, ...document } = formData.doc
        delete document['x-meditor'] // x-meditor metadata, shouldn't be there but ensure it isn't

        // only allow updating the document during a state change if the user has edit privileges
        // this leaves it up to the workflow to determine whether updating via state change is allowed
        const canUpdateDocument = currentPrivileges.includes('edit') && document

        await fetch(
            `/meditor/api/models/${encodeURIComponent(
                modelName
            )}/documents/${encodeURIComponent(
                documentTitle
            )}/change-document-state?state=${state}&version=${formData.version}`,
            {
                method: 'POST',

                // optionally update the document by switching to a PUT
                ...(canUpdateDocument && {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(document),
                }),
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
                        readOnly={!currentPrivileges.includes('edit')}
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
                    open={
                        activePanel == 'workflow' &&
                        model.name?.toLowerCase() === 'workflows'
                    }
                    title="Workflow"
                >
                    <DocumentWorkflow workflow={formData?.doc} />
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
    const session = await getServerSession(req, res)

    const [pageDocumentError, pageDocument] = await getDocument(
        decodeURIComponent(documentTitle.toString()),
        decodeURIComponent(modelName.toString()),
        session.user
    )

    // No point in displaying the page if our core resource has errored or is missing.
    if (pageDocumentError) {
        return { notFound: true }
    }

    // TODO: handle an error retrieving the model
    const [modelError, modelWithWorkflow] = await getModelWithWorkflow(
        modelName.toString(),
        pageDocument['x-meditor'].state,
        { populateMacroTemplates: true }
    )

    const [commentsError, comments] = await getCommentsForDocument(
        decodeURIComponent(documentTitle.toString()),
        decodeURIComponent(modelName.toString())
    )

    const [documentHistoryError, documentHistory] = await getDocumentHistory(
        decodeURIComponent(documentTitle.toString()),
        decodeURIComponent(modelName.toString())
    )

    const currentPrivileges = privilegesForModelAndWorkflowNode(
        session.user,
        modelName.toString(),
        modelWithWorkflow.workflow.currentNode
    )

    const props = {
        comments: !!commentsError ? null : treeify(comments),
        pageDocument: adaptDocumentToLegacyDocument(pageDocument),
        documentHistory: !!documentHistoryError ? null : documentHistory,
        model: modelWithWorkflow,
        currentPrivileges,
    }

    return { props }
}

export default EditDocumentPage
