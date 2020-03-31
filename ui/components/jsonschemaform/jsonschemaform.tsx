import React from 'react'
import Form from 'react-jsonschema-form'
import fields from './fields/'
import widgets from './widgets/'

const JsonSchemaForm = ({ 
    schema, 
    formData, 
    imageUploadUrl = null,
    layout, 
    liveValidate = true,
    onChange,
    onSubmit,
    onError, 
}) => (
    <Form 
        schema={schema} 
        formData={formData}
        uiSchema={layout}
        fields={fields}
        widgets={widgets}
        ObjectFieldTemplate={fields.FlexLayoutField}
        liveValidate={liveValidate}
        onChange={onChange} 
        onSubmit={onSubmit} 
        onError={onError}
        formContext={{ 
            // use the configured image upload url or default to LB if none found
            imageUploadUrl: imageUploadUrl || 'https://lb.gesdisc.eosdis.nasa.gov/images/upload', 
        }}
    />
)

export default JsonSchemaForm
