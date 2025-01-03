import DocumentHeader from '../../../components/document/document-header'
import Form from '../../../components/document/form'
import FormActions from '../../../components/document/form-actions'
import format from 'date-fns/format'
import omitBy from 'lodash.omitby'
import PageTitle from '../../../components/page-title'
import Spinner from 'react-bootstrap/Spinner'
import { AiOutlineCheck } from 'react-icons/ai'
import { AppContext } from '../../../components/app-store'
import { Breadcrumb, Breadcrumbs } from '../../../components/breadcrumbs'
import { createDocument as httpCreateDocument } from '../../../documents/http'
import { getModelWithWorkflow } from '../../../models/service'
import { getServerSession } from 'auth/user'
import { privilegesForModelAndWorkflowNode } from 'auth/utilities'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import type { NextPageContext } from 'next'
import {
    getNewUnsavedDocument,
    removeUnsavedDocumentFromLS,
    retrieveUnsavedDocumentFromLS,
    UNTITLED_DOCUMENT_TITLE,
    updateUnsavedDocumentInLS,
} from '../../../lib/unsaved-changes'
import type { ModelWithWorkflow } from '../../../models/types'

interface NewDocumentPageProps {
    model: ModelWithWorkflow
}

const NewDocumentPage = ({ model }: NewDocumentPageProps) => {
    const { data: session } = useSession()
    const router = useRouter()

    const params = router.query
    const modelName = params.modelName as string
    const localId = params.localId as string

    const [localChanges, setLocalChanges] = useState(
        localId
            ? retrieveUnsavedDocumentFromLS(modelName, localId)
            : getNewUnsavedDocument(modelName, session?.user.uid)
    )

    const [autosavingTimer, setAutosavingTimer] = useState(null)

    const hasFormData =
        localChanges?.formData && Object.keys(localChanges.formData).length

    const [form, setForm] = useState(null)
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const currentPrivileges = session?.user
        ? privilegesForModelAndWorkflowNode(
              session.user,
              modelName,
              model.workflow.currentNode
          )
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

        const [error, _createdDocument] = await httpCreateDocument(
            document,
            modelName
        )

        if (error) {
            setErrorNotification(error.message ?? 'Failed to create the document')
            return
        }

        // remove the unsaved changes from LS now that the user has saved
        removeUnsavedDocumentFromLS(localChanges)

        setSuccessNotification('Successfully created the document')

        redirectToDocumentEdit(document)
    }

    function onChange(formData: any) {
        let titleProperty = model.titleProperty
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
                allowValidationErrors={
                    model.workflow.currentNode.allowValidationErrors
                }
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
                    allowValidationErrors={
                        model.workflow.currentNode.allowValidationErrors
                    }
                />
            )}
        </div>
    )
}

export async function getServerSideProps(ctx: NextPageContext) {
    const { modelName } = ctx.query
    const session = await getServerSession(ctx.req, ctx.res)

    const [_modelError, model] = await getModelWithWorkflow(
        modelName.toString(),
        undefined,
        { populateMacroTemplates: true }
    )

    //! TODO: handle a modelError

    const currentPrivileges = privilegesForModelAndWorkflowNode(
        session.user,
        modelName.toString(),
        model.workflow.currentNode
    )

    return {
        props: {
            model,
            currentPrivileges,
        },
    }
}

export default NewDocumentPage
