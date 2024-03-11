import Form, { FormProps, FormState } from '@rjsf/core'
import jp from 'jsonpath'
import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'
import { useEffect, useRef } from 'react'
import fields from './fields/'
import templates from './templates/'
import widgets from './widgets/'
import validator from '@rjsf/validator-ajv8'
import type {
    ErrorSchema,
    FormContextType,
    FormValidation,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils'

class DebouncedForm<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
> extends Form {
    debounceableNodes = ['INPUT']
    superOnChange = this.onChange

    constructor(props: FormProps<T, S, F>) {
        super(props)
    }

    componentDidMount() {
        this.formElement.current.addEventListener('input', this.updateWithoutState, {
            capture: true,
        })
    }

    componentWillUnmount() {
        this.formElement.current.removeEventListener(
            'input',
            this.updateWithoutState,
            { capture: true }
        )
    }

    static debounce(fn: Function, delay = 400) {
        let timerId: NodeJS.Timeout

        return (...args: any[]) => {
            globalThis.clearTimeout(timerId)

            timerId = setTimeout(() => fn(...args), delay)
        }
    }

    /* For debounceable nodes:
     * - Do not propagate event to prevent triggering React's synthetic `change` event.
     * - Do call a debounced `change` event emitter to trigger original form validations.
     */
    updateWithoutState = (event: any) => {
        if (this.debounceableNodes.includes(event.target.nodeName)) {
            event.stopPropagation()

            this.emitTargetChange(event)
        }
    }

    /* Debounced roughly at the speed of typing. */
    emitTargetChange = DebouncedForm.debounce((event: any) => {
        console.log('emitTargetChange')

        event.target.setAttribute('readonly', true)

        event.target.dispatchEvent(new Event('change', { bubbles: true }))

        globalThis.setTimeout(() => {
            event.target.removeAttribute('readonly')
        }, 1000)
    }, 1000)

    /* Overwrite superclass method: add debouncing, then call super's original. */
    onChange = DebouncedForm.debounce(
        (formData: T | undefined, newErrorSchema?: ErrorSchema<T>, id?: string) => {
            console.log('onChange')
            this.superOnChange(formData, newErrorSchema, id)
        }
    )
}

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

    //* This function gets called with formEl.current.validate().
    //* You can create any custom validation needed and add it to this stack.
    function validate(formData: any, errors: FormValidation) {
        validateCustomWidgets(formData, errors)

        return errors
    }

    return (
        <DebouncedForm
            ref={formEl}
            schema={schema}
            formData={document}
            uiSchema={layout}
            fields={fields as any}
            widgets={widgets}
            templates={{
                ArrayFieldTemplate: templates.ArrayFieldTemplate,
                ArrayFieldItemTemplate: templates.ArrayFieldItemTemplate,
                ObjectFieldTemplate: templates.FlexLayoutTemplate,
                FieldTemplate: templates.CustomFieldTemplate,
                DescriptionFieldTemplate: templates.DescriptionFieldTemplate,
            }}
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
            validator={validator}
            customValidate={validate}
            // see https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props/#experimental_defaultformstatebehavior
            experimental_defaultFormStateBehavior={{
                arrayMinItems: {
                    populate: 'requiredOnly', // ignore minItems on a field when calculating defaults unless the field is required
                },
                emptyObjectFields: 'populateRequiredDefaults', // only set the default value when parent is required (for objects) or when the field is required (for primitives)
            }}
        />
    )
}

export default JsonSchemaForm

//* Validate custom widgets here because of this issue: https://github.com/rjsf-team/react-jsonschema-form/issues/2718
function validateCustomWidgets(formData: any, errors: FormValidation) {
    formData.templates?.forEach((template: any, index: number) => {
        //* Another schema may have a `templates` property, but not intend it for macros. This attempts to guard against that.
        if (!('jsonpath' in template)) {
            return
        }

        //* Macro templates can reference either the schema or layout (see macro ReadMe).
        const isValid = [
            validatePath(template.jsonpath, JSON.parse(formData.schema || '{}')),
            validatePath(template.jsonpath, JSON.parse(formData.layout || '{}')),
        ].some(result => result === true)

        if (!isValid) {
            errors.templates[index].jsonpath?.addError(
                'This does not match a valid path in either the schema or the layout.'
            )
        }
    })

    return errors
}

function validatePath(jsonPath: string, json: object) {
    try {
        const hasValueAtPath = jp.query(json, jsonPath).length > 0

        return hasValueAtPath
    } catch {
        return false
    }
}
