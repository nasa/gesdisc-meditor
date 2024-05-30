import React, { useRef, useEffect, useState } from 'react'
import Tagify from '@yaireo/tagify'
import type { WidgetProps } from '@rjsf/utils'

function optionHasValue(option) {
    if (!option) {
        return false
    }

    if (typeof option === 'object') {
        return option.value && option.value != ''
    }

    return option != ''
}

function getEnumOptionsAsLabelValue(
    enumOptions: string[] | { label: string; value: string }[]
) {
    return (
        enumOptions
            // @ts-ignore
            ?.filter(optionHasValue)
            .map(option =>
                typeof option === 'string' ? { label: option, value: option } : option
            ) ?? []
    )
}

function MultiSelectWidget(props: WidgetProps) {
    const {
        id,
        placeholder,
        required,
        disabled,
        readonly,
        autofocus,
        value,
        options,
        onChange,
    } = props
    const [tagify, setTagify] = useState(null)

    const inputEl = useRef(null)

    useEffect(() => {
        if (tagify) return

        let tagifyOptions = {
            mode: !props.multiple ? 'select' : null,
            whitelist: getEnumOptionsAsLabelValue(options.enumOptions),
            enforceWhitelist:
                'enforceEnumOptions' in options ? options.enforceEnumOptions : true,
            keepInvalidTags:
                'keepInvalidTags' in options ? options.keepInvalidTags : true,
            dropdown: {
                enabled: 'dropdownEnabled' in options ? options.dropdownEnabled : 0,
                maxItems: 'maxOptions' in options ? options.maxOptions : 1000,
            },
            delimiters: null,
        }

        setTagify(new Tagify(inputEl.current, tagifyOptions))
    }, [inputEl, tagify, options.enum, options.enumOptions])

    useEffect(() => {
        if (!tagify) return

        const handleTagsChanged = event => {
            let selectedItems = event.detail.tagify.value.map(item => item.value)
            onChange(!props.multiple ? selectedItems.join(',') : selectedItems)
        }

        tagify.on('add', handleTagsChanged)
        tagify.on('remove', handleTagsChanged)
        tagify.on('dropdown:select', handleTagsChanged)
    }, [tagify, onChange])

    useEffect(() => {
        if (!tagify) return

        tagify.settings.whitelist = getEnumOptionsAsLabelValue(options.enumOptions)
    }, [tagify, options.enum, options.enumOptions])

    let filteredValue = value && typeof value === 'string' ? [value] : value

    filteredValue = filteredValue
        ? filteredValue.map(value =>
              typeof value === 'string' ? { value: value } : value
          )
        : []

    return (
        <input
            ref={inputEl}
            className="form-input-control"
            id={id}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            autoFocus={autofocus || false}
            defaultValue={JSON.stringify(filteredValue)}
        />
    )
}

export default MultiSelectWidget
