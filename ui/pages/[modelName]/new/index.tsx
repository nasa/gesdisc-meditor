import { useQuery } from '@apollo/react-hooks'
import format from 'date-fns/format'
import gql from 'graphql-tag'
import omitBy from 'lodash.omitby'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { AiOutlineCheck } from 'react-icons/ai'
import { AppContext } from '../../../components/app-store'
import { Breadcrumb, Breadcrumbs } from '../../../components/breadcrumbs'
import DocumentHeader from '../../../components/document/document-header'
import Form from '../../../components/document/form'
import FormActions from '../../../components/document/form-actions'
import Loading from '../../../components/loading'
import PageTitle from '../../../components/page-title'
import RenderResponse from '../../../components/render-response'
import withAuthentication from '../../../components/with-authentication'
import { withApollo } from '../../../lib/apollo'
import {
    getNewUnsavedDocument,
    removeUnsavedDocumentFromLS,
    retrieveUnsavedDocumentFromLS,
    UNTITLED_DOCUMENT_TITLE,
    updateUnsavedDocumentInLS,
} from '../../../lib/unsaved-changes'
import { urlEncode } from '../../../lib/url'
import mEditorApi from '../../../service'

const MODEL_QUERY = gql`
    query getModel($modelName: String!) {
        model(modelName: $modelName) {
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
                    privileges {
                        role
                        privilege
                    }
                    allowValidationErrors
                }
            }
        }
    }
`

const NewDocumentPage = ({ user }) => {
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

    const { loading, error, data } = useQuery(MODEL_QUERY, {
        variables: { modelName },
    })

    const currentPrivileges = data?.model?.workflow
        ? user.privilegesForModelAndWorkflowNode(
              modelName,
              data.model.workflow.currentNode
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
        let documentName = urlEncode(document[data.model.titleProperty])
        router.push(
            '/[modelName]/[documentTitle]',
            `/${urlEncode(modelName)}/${documentName}`
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
        let titleProperty = data?.model?.titleProperty
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
        router.push('/[modelName]', `/${urlEncode(modelName)}`)
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

            <DocumentHeader model={data?.model} togglePanelOpen toggleJsonDiffer />

            <RenderResponse
                loading={loading}
                error={error}
                loadingComponent={<Loading text={`Loading...`} />}
                errorComponent={
                    <Alert variant="danger">
                        <p>Failed to load the page.</p>
                        <p>
                            This is most likely temporary, please wait a bit and
                            refresh the page.
                        </p>
                        <p>
                            If the error continues to occur, please open a support
                            ticket.
                        </p>
                    </Alert>
                }
            >
                <Form
                    model={data?.model}
                    document={localChanges?.formData}
                    onUpdateForm={setForm}
                    onChange={onChange}
                    allowValidationErrors={
                        data?.model.workflow.currentNode.allowValidationErrors
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
                            data?.model.workflow.currentNode.allowValidationErrors
                        }
                    />
                )}
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication()(NewDocumentPage))
