import dynamic from 'next/dynamic'

// JsonSchemaForm widgets rely heavily on global window, so we'll need to load them in separately
// as the server side doesn't have a window!
const JsonSchemaForm = dynamic(
    () => import('./jsonschemaform/jsonschemaform'),
    { ssr: false }
)

const Form = ({ 
    model, 
    document,
    liveValidate = false,
    onUpdateForm,
    onChange = (data: any) => {},
}) => { 
    let layout = model?.uiSchema || model?.layout || '{}'
    let formData = document?.doc || document || {}

    return (
        <JsonSchemaForm
            schema={model ? JSON.parse(model.schema) : {}}
            formData={formData}
            layout={JSON.parse(layout)}
            liveValidate={liveValidate}
            onInit={onUpdateForm}
            onChange={(event: any) => onChange(event?.formData)}
            imageUploadUrl={process.env.IMAGE_UPLOAD_URL}
            linkCheckerUrl={process.env.LINK_CHECKER_URL}
        />
    )
}

export default Form
