import { useState } from 'react'
import dynamic from 'next/dynamic'
import FormActions from './form-actions'

// JsonSchemaForm widgets rely heavily on global window, so we'll need to load them in separately
// as the server side doesn't have a window!
const JsonSchemaForm = dynamic(
    () => import('./jsonschemaform/jsonschemaform'),
    { ssr: false }
)

const Form = ({ 
    model, 
    document = {
        doc: {}
    },
}) => {
    const [ form, setForm ] = useState(null)

    return (
        <>
            <JsonSchemaForm
                schema={model ? JSON.parse(model.schema) : {}}
                formData={document ? document.doc : {}}
                layout={model ? JSON.parse(model.layout) : {}}
                liveValidate={false}
                onInit={setForm}
            />

            <FormActions form={form} onSave={() => console.log('save the document')} />
        </>
    )
}

export default Form
