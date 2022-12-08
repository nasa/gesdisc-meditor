import React from 'react'
import IconButton from '../components/IconButton'
import { utils } from '@rjsf/core'

const { ADDITIONAL_PROPERTY_FLAG } = utils

const REQUIRED_FIELD_SYMBOL = '*'

function Label(props) {
    const { label, required, id, description } = props

    if (!label) {
        return null
    }

    return (
        <div className="control-label-container">
            <label className="control-label" htmlFor={id}>
                {label}
                {required && (
                    <span className="required">{REQUIRED_FIELD_SYMBOL}</span>
                )}
            </label>

            {description ? description : null}
        </div>
    )
}

function LabelInput(props) {
    const { id, label, onChange } = props
    return (
        <input
            className="form-control"
            type="text"
            id={id}
            onBlur={event => onChange(event.target.value)}
            defaultValue={label}
        />
    )
}

/**
 * additional fields are in the underlying JSON document but NOT in the schema
 *
 * Take a schema that defines fields called "name" and "address".
 * If the JSON document contains a field called "phone number" it is considered an additional field.
 */
function WrapIfAdditional(props) {
    const {
        id,
        classNames,
        disabled,
        label,
        onKeyChange,
        onDropPropertyClick,
        readonly,
        required,
        schema,
    } = props
    const keyLabel = `${label} Key` // i18n ?
    const additional = schema.hasOwnProperty(ADDITIONAL_PROPERTY_FLAG)

    if (!additional) {
        return <div className={classNames}>{props.children}</div>
    }

    // in mEditor, we don't want to show additional fields, but DO want to keep them in the JSON document
    // we'll just display: none them
    const additionalFieldClassNames = `${classNames} d-none`

    return (
        <div className={additionalFieldClassNames}>
            <div className="row">
                <div className="col-xs-5 form-additional">
                    <div className="form-group">
                        <Label
                            label={keyLabel}
                            required={required}
                            id={`${id}-key`}
                        />
                        <LabelInput
                            label={label}
                            required={required}
                            id={`${id}-key`}
                            onChange={onKeyChange}
                        />
                    </div>
                </div>
                <div className="form-additional form-group col-xs-5">
                    {props.children}
                </div>
                <div className="col-xs-2">
                    <IconButton
                        type="danger"
                        icon="remove"
                        className="array-item-remove btn-block"
                        tabIndex="-1"
                        style={{ border: '0' }}
                        disabled={disabled || readonly}
                        onClick={onDropPropertyClick(label)}
                    />
                </div>
            </div>
        </div>
    )
}

function CustomFieldTemplate(props) {
    const {
        id,
        label,
        children,
        errors,
        help,
        description,
        hidden,
        required,
        displayLabel,
    } = props

    if (hidden) {
        return <div className="hidden">{children}</div>
    }

    return (
        <WrapIfAdditional {...props}>
            {displayLabel && (
                <Label
                    label={label}
                    required={required}
                    id={id}
                    description={description}
                />
            )}
            {children}
            {errors}
            {help}
        </WrapIfAdditional>
    )
}

export default CustomFieldTemplate
