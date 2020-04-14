import Button from 'react-bootstrap/Button'
import { useRef } from 'react'
import styles from './form-actions.module.css'

const FormActions = ({ actions = [], privileges, form, onSave, onUpdateState = (target: string) => {} }) => {
    const saveEl = useRef(null)
    const canSave = privileges.includes('edit') || privileges.includes('create')

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
