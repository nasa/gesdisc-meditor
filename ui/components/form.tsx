import dynamic from 'next/dynamic'

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
    liveValidate = false,
    onUpdateForm,
}) => { 
    let layout = model?.uiSchema || model?.layout || '{}'

    return (
        <JsonSchemaForm
            schema={model ? JSON.parse(model.schema) : {}}
            formData={document ? document.doc : {}}
            layout={JSON.parse(layout)}
            liveValidate={liveValidate}
            onInit={onUpdateForm}
        />
    )
}

export default Form
