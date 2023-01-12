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

    const _onChange = ({ target }) => {
        return props.onChange(
            target.innerHTML === '' ? options.emptyValue : target.innerHTML
        )
    }

    return (
        <div
            contentEditable={true}
            key={inputProps.id}
            className="form-control"
            aria-readonly={readonly}
            onInput={_onChange}
            onBlur={
                onBlur && (event => onBlur(inputProps.id, event.target.innerHTML))
            }
            onFocus={
                onFocus && (event => onFocus(inputProps.id, event.target.innerHTML))
            }
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
