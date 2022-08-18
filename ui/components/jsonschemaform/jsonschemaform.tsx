import Form from '@rjsf/core'
import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'
import { useEffect, useRef } from 'react'
import fields from './fields/'
import templates from './templates/'
import widgets from './widgets/'

const JsonSchemaForm = ({
    schema,
    formData,
    imageUploadUrl = null,
    linkCheckerUrl = null,
    layout,
    liveValidate = false,
    allowValidationErrors = false,
    onInit = (form: any) => {},
    onChange = (event: any) => {},
}) => {
    const formEl: any = useRef(null)

    useEffect(() => {
        // on form load, clear out any broken links first
        localStorage?.removeItem('brokenLinks')
    }, [])

    useEffect(() => {
        onInit(formEl?.current)
    }, [onInit, formEl])

    function onBlur(...args) {
        setTimeout(() => {
            const field = args[0].replace('root_', '')

            if (!formEl.current) return

            const { formData, errors, errorSchema } = formEl.current.state

            const { errors: _errors, errorSchema: _errorSchema } =
                formEl.current.validate(formData)

            const prevOtherFieldErrors = filter(
                errors,
                error => error['property'] !== `.${field}`
            )

            const fieldErrors = filter(_errors, ['property', `.${field}`])

            const fieldErrorSchema = _errorSchema[field] || {}

            if (!allowValidationErrors) {
                formEl.current.setState({
                    errors: uniqWith(
                        [...prevOtherFieldErrors, ...fieldErrors],
                        isEqual
                    ),
                    errorSchema: { ...errorSchema, [field]: fieldErrorSchema },
                })
            }
        }, 10)
    }

    const { _id, ...document } = formData

    return (
        <Form
            ref={formEl}
            schema={schema}
            formData={document}
            uiSchema={layout}
            fields={fields as any}
            widgets={widgets}
            ObjectFieldTemplate={templates.FlexLayoutTemplate}
            FieldTemplate={templates.CustomFieldTemplate}
            liveValidate={liveValidate}
            onBlur={onBlur}
            onChange={onChange}
            formContext={{
                // use the configured image upload url or default to LB if none found
                imageUploadUrl:
                    imageUploadUrl ||
                    'https://lb.gesdisc.eosdis.nasa.gov/images/upload',
                linkCheckerApiUrl: linkCheckerUrl,
            }}
            noValidate={allowValidationErrors}
            noHtml5Validate={allowValidationErrors}
        />
    )
}

export default JsonSchemaForm
