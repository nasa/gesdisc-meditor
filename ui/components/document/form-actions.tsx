import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { clearEmpties } from '../../utils/object'
import styles from './form-actions.module.css'
import { Validator } from 'jsonschema'
import {
    filterErrorsFromErrorSchema,
    toErrorList,
} from '../../utils/jsonschema-validate'

const DELETED_STATE = 'Deleted'
const DELETE_CONFIRMATION =
    "Are you sure you want to delete this document?\n\nThis document will be deleted immediately. You can't undo this action."

const FormActions = ({
    actions = [],
    showActions = true,
    confirmUnsavedChanges = false,
    privileges,
    form,
    formData,
    onSave,
    onUpdateState = (target: string) => {},
    onDelete = null,
    CustomActions = null,
    allowValidationErrors = false,
}) => {
    const canSave = privileges.includes('edit') || privileges.includes('create')
    const router = useRouter()

    const [initialFormData, setInitialFormData] = useState(null)
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (!formData) return

        if (!initialFormData) {
            setInitialFormData(formData)
            return
        }

        let data = cloneDeep(formData)
        Object.keys(data).forEach(key =>
            data[key] === undefined ? delete data[key] : ''
        )

        setIsDirty(!isEqual(initialFormData, data))
    }, [formData])

    // subscribe to route change so we can
    useEffect(() => {
        router.events.on('routeChangeStart', handleUnsavedChanges)

        window.addEventListener('beforeunload', handleUnsavedChanges)

        return () => {
            router.events.off('routeChangeStart', handleUnsavedChanges)

            window.removeEventListener('beforeunload', handleUnsavedChanges)
        }
    }, [])

    // TODO: add a test for this as the NextJS Router API has changed in the past
    function handleUnsavedChanges(event) {
        if (!isDirty || !confirmUnsavedChanges) return

        let confirmationMessage =
            'You have unsaved changes on this page. Press Cancel to go back and save these changes, or OK to lose these changes.'

        if (typeof event === 'string') {
            // this is a routechange coming from NextJS
            if (!confirm(confirmationMessage)) {
                // cancel the route change, the user wants to save their changes
                router.events.emit('routeChangeError')
                throw 'routeChange aborted by the user due to unsaved changes in the document. This error can be safely ignored.'
            }
        } else {
            // this is a URL change, the user tried to navigate to another URL
            event.returnValue = confirmationMessage
            return confirmationMessage
        }
    }

    /**
     * unfortunately, RJSF forces the underlying JSON document to contain undefined, empty arrays, etc. that cause
     * wrong validation results to be returned
     *
     * to fix the wrong validation results, we will call our own validate (using `jsonschema`) then only return
     * the RJSF validation errors that are in both lists of errors
     *
     * TODO: upgrade RSJF to v5 (after beta testing) and review if this is still necessary
     */
    function validateAllFields(formData: any) {
        const { errorSchema } = form.validate(formData) // retrieve validation result schema from RJSF
        const { errors } = new Validator().validate(formData, form.state.schema) // retrieve validation results from JSF

        // get a filtered list of validation errors
        const filteredErrorSchema = filterErrorsFromErrorSchema(errors, errorSchema)
        const filteredErrors = toErrorList(filteredErrorSchema)

        form.setState({
            errors: filteredErrors,
            errorSchema: filteredErrorSchema,
        })

        return filteredErrors
    }

    function handleSave() {
        let brokenLinks = localStorage.getItem('brokenLinks')
        let hasBrokenLinks =
            brokenLinks && Object.values(JSON.parse(brokenLinks)).includes('false')

        if (
            hasBrokenLinks &&
            !confirm(
                'There are broken links in your document, are you sure you want to save?'
            )
        ) {
            return
        }

        // react-jsonschema-form leaves undefined values, empty arrays, etc.
        // we need to make sure these are all removed before running validation
        let formData = clearEmpties(form.state.formData)

        if (!allowValidationErrors) {
            let errors = validateAllFields(formData)

            if (errors.length) {
                // errors are printed above the save button, pushing it down. scroll it back
                setTimeout(() => {
                    let errorPanel = document.querySelector('.rjsf > .panel.errors')

                    if (!errorPanel) return

                    errorPanel.scrollIntoView()
                }, 10)

                return
            }
        }

        setIsDirty(false)
        onSave(formData)
    }

    function handleStateUpdate(target) {
        // if this is a deletion, confirm with the user first
        if (target == DELETED_STATE && !confirm(DELETE_CONFIRMATION)) {
            return
        }

        onUpdateState(target)
    }

    function confirmAndHandleDelete() {
        if (!confirm(DELETE_CONFIRMATION)) {
            return
        }

        onDelete()
    }

    /**
     * a filter function for returning only unique actions, matches unique label and target combinations
     * (example action: { label: "Delete", target: "Deleted" })
     *
     * @param { label, target }
     * @param index
     * @param actions
     * @returns
     */
    function uniqueAction({ label, target }, index, actions) {
        return (
            actions.findIndex(
                action => action.label === label && action.target === target
            ) === index
        )
    }

    /**
     * if there are no actions on the bar, just hide the bar!
     */
    if (!onDelete && !canSave && !showActions && !CustomActions) {
        return <></>
    }

    const deletionActions = actions.filter(action => action.target == DELETED_STATE)

    return (
        <div className={`container-fluid ${styles.container}`}>
            <div>
                {onDelete && (
                    <Button variant="outline-danger" onClick={confirmAndHandleDelete}>
                        Delete
                    </Button>
                )}

                {showActions && deletionActions.length > 0 && (
                    <Button
                        className={styles.button}
                        variant="outline-danger"
                        onClick={() => handleStateUpdate(DELETED_STATE)}
                    >
                        {deletionActions[0]?.label}
                    </Button>
                )}

                {canSave && (
                    <Button
                        className={styles.button}
                        variant="secondary"
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                )}

                {showActions &&
                    actions
                        .filter(action => action.target !== DELETED_STATE)
                        .map(action => (
                            <Button
                                key={action.label}
                                className={styles.button}
                                variant="secondary"
                                onClick={() => handleStateUpdate(action.target)}
                            >
                                {action.label}
                            </Button>
                        ))}

                {CustomActions}
            </div>
        </div>
    )
}

export default FormActions
