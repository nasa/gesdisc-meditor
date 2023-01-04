import React from 'react'

function IconWidget(props) {
    const {
        schema,
        id,
        options,
        value,
        required,
        disabled,
        readonly,
        autofocus,
        onChange,
        onBlur,
        onFocus,
        placeholder,
    } = props
    const { enumOptions, enumDisabled } = options
    return (
        <select
            id={id}
            className="form-control"
            value={typeof value === 'undefined' ? '' : value}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus}
            onBlur={onBlur && (event => onBlur(id, event.target.value))}
            onFocus={onFocus && (event => onFocus(id, event.target.value))}
            onChange={event => onChange(event.target.value)}
        >
            {schema.default === undefined && <option value="">{placeholder}</option>}
            {enumOptions.map(({ value, label }, i) => {
                const disabled = enumDisabled && enumDisabled.indexOf(value) !== -1
                return (
                    <option key={i} value={value} disabled={disabled}>
                        {label}
                    </option>
                )
            })}
        </select>
    )
}

IconWidget.defaultProps = {
    autofocus: false,
}

export default IconWidget
