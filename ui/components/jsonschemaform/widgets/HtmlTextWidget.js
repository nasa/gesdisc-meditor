import React from 'react'

function HtmlTextWidget(props) {
    const {
        value,
        readonly,
        disabled,
        autofocus,
        onBlur,
        onFocus,
        options,
        schema,
        uiSchema,
        formContext,
        registry,
        rawErrors,
        ...inputProps
    } = props

    if (options.autocomplete) {
        inputProps.autoComplete = options.autocomplete
    }

    const _onChange = ({ target: { value } }) => {
        return props.onChange(value === '' ? options.emptyValue : value)
    }

    return (
        <div
            contentEditable={true}
            key={inputProps.id}
            className="form-control"
            readOnly={readonly}
            disabled={disabled}
            autoFocus={autofocus}
            onChange={_onChange}
            onBlur={onBlur && ((event) => onBlur(inputProps.id, event.target.value))}
            onFocus={onFocus && ((event) => onFocus(inputProps.id, event.target.value))}
            dangerouslySetInnerHTML={{ __html: value == null ? '' : value }}
        />
    )
}

HtmlTextWidget.defaultProps = {
    required: false,
    disabled: false,
    readonly: false,
    autofocus: false,
}

export default HtmlTextWidget
