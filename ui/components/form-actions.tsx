import Button from 'react-bootstrap/Button'
import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styles from './form-actions.module.css'
import isEqual from 'lodash.isequal'
import cloneDeep from 'lodash.clonedeep'

const FormActions = ({ actions = [], privileges, form, formData, onSave, onUpdateState = (target: string) => {} }) => {
    const saveEl = useRef(null)
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
        Object.keys(data).forEach(key => (data[key] === undefined ? delete data[key] : ''))

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
    })

    // TODO: add a test for this as the NextJS Router API has changed in the past
    function handleUnsavedChanges(event) {
        if (!isDirty) return

        let confirmationMessage = 'You have unsaved changes on this page. Press Cancel to go back and save these changes, or OK to lose these changes.'
        
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

    function validateAllFields() {
        const { formData } = form.state
        const { errors, errorSchema } = form.validate(formData)

        form.setState({
            errors,
            errorSchema,
        })

        return errors
    }

    function handleSave() {
        let brokenLinks = localStorage.getItem('brokenLinks')
        let hasBrokenLinks = brokenLinks && Object.values(JSON.parse(brokenLinks)).includes("false")

        if (hasBrokenLinks && !confirm('There are broken links in your document, are you sure you want to save?')) {
            return
        }

        let errors = validateAllFields()

        // don't save a document that has errors!
        if (errors.length) {
            // errors are printed above the save button, pushing it down. scroll it back
            setTimeout(() => saveEl.current.scrollIntoView(), 10)
            return
        }

        onSave(form.state.formData) // no errors, document can be saved!
    }

    function handleStateUpdate(target) {
        onUpdateState(target)
    }

    return (
        <>
            {canSave && (
                <Button className={styles.button} variant="secondary" onClick={handleSave} ref={saveEl}>
                    Save
                </Button>
            )}

            {actions.map(action => (
                <Button key={action.label} className={styles.button} variant="secondary" onClick={() => handleStateUpdate(action.target)}>   
                    {action.label}
                </Button>
            ))}
        </>
    )
}

export default FormActions
