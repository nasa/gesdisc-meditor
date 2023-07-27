import React from 'react'

function TitlePropertyWidget(props) {
    const {
        id,
        placeholder,
        required,
        disabled,
        readonly,
        autofocus,
        value,
        onChange,
        onBlur,
    } = props

    return (
        <input
            type="text"
            className="form-control"
            id={id}
            placeholder={placeholder}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus || false}
            value={value}
            onBlur={event => {
                onChange(event.target.value.trim())
                onBlur(id, event.target.value)
            }}
            onChange={event => onChange(event.target.value)}
        />
    )
}

export default TitlePropertyWidget
