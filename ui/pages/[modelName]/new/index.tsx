import format from 'date-fns/format'
import omitBy from 'lodash.omitby'
import type { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import { AiOutlineCheck } from 'react-icons/ai'
import { AppContext } from '../../../components/app-store'
import { Breadcrumb, Breadcrumbs } from '../../../components/breadcrumbs'
import DocumentHeader from '../../../components/document/document-header'
import Form from '../../../components/document/form'
import FormActions from '../../../components/document/form-actions'
import PageTitle from '../../../components/page-title'
import withAuthentication from '../../../components/with-authentication'
import {
    getNewUnsavedDocument,
    removeUnsavedDocumentFromLS,
    retrieveUnsavedDocumentFromLS,
    UNTITLED_DOCUMENT_TITLE,
    updateUnsavedDocumentInLS,
} from '../../../lib/unsaved-changes'
import { getModel } from '../../../models/service'
import mEditorApi from '../../../service'
import {
    getWorkflow,
    getWorkflowNodeAndEdgesForState,
} from '../../../workflows/service'

const NewDocumentPage = ({ user, model, workflow, currentEdges, currentNode }) => {
    const router = useRouter()

    const params = router.query
    const modelName = params.modelName as string
    const localId = params.localId as string

    const [localChanges, setLocalChanges] = useState(
        localId
            ? retrieveUnsavedDocumentFromLS(modelName, localId)
            : getNewUnsavedDocument(modelName, user.uid)
    )

    const [autosavingTimer, setAutosavingTimer] = useState(null)

    const hasFormData =
        localChanges?.formData && Object.keys(localChanges.formData).length

    const [form, setForm] = useState(null)
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const currentPrivileges = workflow
        ? user.privilegesForModelAndWorkflowNode(modelName, currentNode)
        : []

    // set initial formData
    useEffect(() => {
        if (!form?.state) return
        onChange(form.state.formData)
    }, [form])

    // save changes to form in localstorage for later retrieval
    useEffect(() => {
        // simulate a long save, the real save to local storage happens instantaneously
        // but it helps to show user that something is happening in the background
        clearTimeout(autosavingTimer)
        setAutosavingTimer(
            setTimeout(() => {
                setAutosavingTimer(null)
            }, 1000)
        )

        // trigger the save to local storage
        updateUnsavedDocumentInLS(localChanges)
    }, [localChanges])

    function redirectToDocumentEdit(document) {
        let documentName = encodeURIComponent(document[model.titleProperty])
        router.push(
            '/[modelName]/[documentTitle]',
            `/${encodeURIComponent(modelName)}/${documentName}`
        )
    }

    async function createDocument(document) {
        document['x-meditor'] = {}
        document['x-meditor'].model = modelName

        let documentBlob = new Blob([JSON.stringify(document)])

        try {
            await mEditorApi.putDocument(documentBlob)

            // remove the unsaved changes from LS now that the user has saved
            removeUnsavedDocumentFromLS(localChanges)

            setSuccessNotification('Successfully created the document')
            redirectToDocumentEdit(document)
        } catch (err) {
            console.error('Failed to create document ', err)
            setErrorNotification('Failed to create the document')
        }
    }

    function onChange(formData: any) {
        let titleProperty = model?.titleProperty
        let title =
            titleProperty && formData[titleProperty]
                ? formData[titleProperty]
                : UNTITLED_DOCUMENT_TITLE

        setLocalChanges({
            ...localChanges,
            modifiedOn: Date.now(),
            formData: omitBy(
                formData,
                value =>
                    typeof value === 'undefined' ||
                    (Array.isArray(value) && !value.length)
            ),
            title,
        })
    }

    function deleteUnsavedDocument() {
        removeUnsavedDocumentFromLS(localChanges)
        setSuccessNotification(
            `Successfully deleted document: '${localChanges.title}'`
        )
        router.push('/[modelName]', `/${encodeURIComponent(modelName)}`)
    }

    return (
        <div>
            <PageTitle title={['Add New', modelName]} />

            <Breadcrumbs>
                <Breadcrumb
                    title={modelName}
                    href="/[modelName]"
                    as={`/${modelName}`}
                />
                <Breadcrumb title="New" />
            </Breadcrumbs>

            <DocumentHeader model={model} togglePanelOpen toggleJsonDiffer />

            <Form
                model={model}
                document={localChanges?.formData}
                onUpdateForm={setForm}
                onChange={onChange}
                allowValidationErrors={currentNode.allowValidationErrors}
            />

            {form?.state && (
                <FormActions
                    privileges={currentPrivileges}
                    form={form}
                    formData={localChanges?.formData}
                    onSave={createDocument}
                    onDelete={hasFormData ? deleteUnsavedDocument : null}
                    CustomActions={
                        <span className="ml-5 text-secondary">
                            {autosavingTimer ? (
                                <>
                                    <Spinner
                                        animation="border"
                                        variant="secondary"
                                        role="status"
                                        as="span"
                                        size="sm"
                                        className="mr-2"
                                    />
                                    Saving your changes...
                                </>
                            ) : (
                                <>
                                    <AiOutlineCheck className="mr-2" />
                                    Saved locally on{' '}
                                    {format(
                                        new Date(localChanges.modifiedOn),
                                        'M/d/yy, h:mm aaa'
                                    )}
                                </>
                            )}
                        </span>
                    }
                    allowValidationErrors={currentNode.allowValidationErrors}
                />
            )}
        </div>
    )
}

export async function getServerSideProps(ctx: NextPageContext) {
    const { modelName } = ctx.query

    const [_modelError, model] = await getModel(modelName.toString())
    const [_workflowError, workflow] = await getWorkflow(model.workflow)

    const { node, edges } = getWorkflowNodeAndEdgesForState(workflow)

    //! TODO: handle a modelError

    return {
        props: {
            model,
            workflow,
            currentNode: node,
            currentEdges: edges,
        },
    }
}

export default withAuthentication()(NewDocumentPage)
