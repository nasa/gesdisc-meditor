import Button from 'react-bootstrap/Button'
import { useRef } from 'react'

const FormActions = ({ form, onSave }) => {
    const saveEl = useRef(null)

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
        let errors = validateAllFields()
        
        // don't save a document that has errors!
        if (errors.length) {
            // errors are printed above the save button, pushing it down. scroll it back
            setTimeout(() => saveEl.current.scrollIntoView(), 10)
            return
        }

        onSave()    // no errors, document can be saved!
    }

    return (
        <>
            <Button variant="secondary" onClick={handleSave} ref={saveEl}>
                Save
            </Button>
        </>
    )
}

export default FormActions
