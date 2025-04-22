import Form, { FormProps } from '@rjsf/core'
import type {
    FormContextType,
    FormValidation,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import jp from 'jsonpath'
import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'
import { useEffect, useRef } from 'react'
import fields from './fields/'
import templates from './templates/'
import widgets from './widgets/'

class LargeModelForm<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
> extends Form {
    // Set a reference to the super's onChange method as a class field to prevent intermediate value errors.
    superOnChange = this.onChange
    // A list of element node names that we will target for overriding default behavior.
    targetNodeNames = ['INPUT']
    // A store of events that we conditionally re-propagate to RJSF.
    eventStore = {}
    // A store of state locks that get set on various events.
    nodeShouldPropagateStore = {}

    constructor(props: FormProps<T, S, F>) {
        super(props)
    }

    componentDidMount() {
        this.formElement.current.addEventListener('input', this.handleInput, {
            capture: true,
        })
        this.formElement.current.addEventListener('change', this.handleChange, {
            capture: true,
        })
        this.formElement.current.addEventListener('blur', this.handleBlur, {
            capture: true,
        })

        if (super.componentDidMount) {
            super.componentDidMount()
        }
    }

    componentWillUnmount() {
        this.formElement.current.removeEventListener('input', this.handleInput, {
            capture: true,
        })
        this.formElement.current.removeEventListener('change', this.handleChange, {
            capture: true,
        })
        this.formElement.current.removeEventListener('blur', this.handleBlur, {
            capture: true,
        })

        if (super.componentWillUnmount) {
            super.componentWillUnmount()
        }
    }

    /*
     * Targeting only nodes in our allowlist, we conditionally stop propagation so that the ajv8 validator does not get triggered.
     * We state lock the event so that later logic does not propagate its change event.
     */
    handleInput = (event: any) => {
        if (this.targetNodeNames.includes(event.target.nodeName)) {
            event.stopPropagation()

            this.nodeShouldPropagateStore[event.target.id] = false
        }
    }

    /*
     * Targeting only nodes in our allowlist, we conditionally stop propagation so that the ajv8 validator does not get triggered.
     * We store the event for later propagation.
     */
    handleChange = (event: any) => {
        if (
            this.targetNodeNames.includes(event.target.nodeName) &&
            !this.nodeShouldPropagateStore[event.target.id]
        ) {
            event.stopPropagation()

            this.eventStore[event.target.id] = event

            return
        }
    }

    /*
     * Targeting only nodes in our allowlist, we check to make sure node's event has been stored.
     * Because the ajv8 validator is slow on large schemas, we wait until the `blur` event before triggering an update.
     * We mark the node as ready to propagate, re-dispatching the event.
     */
    handleBlur = (event: any) => {
        if (
            this.targetNodeNames.includes(event.target.nodeName) &&
            this.eventStore[event.target.id]
        ) {
            this.nodeShouldPropagateStore[event.target.id] = true

            this.eventStore[event.target.id].target.dispatchEvent(
                this.eventStore[event.target.id]
            )
        }
    }
}

const JsonSchemaForm = ({
    schema,
    formData,
    imageUploadUrl = null,
    linkCheckerUrl = null,
    layout,
    liveValidate = false,
    allowValidationErrors = false,
    largeModel = false,
    onInit = (_form: any) => {},
    onChange = (_event: any) => {},
}) => {
    const FormType = largeModel ? LargeModelForm : Form
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
        <FormType
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
