import React, { useRef, useEffect, useState } from 'react'
import Tagify from '@yaireo/tagify'

function optionHasValue(option) {
    if (!option) {
        return false
    }

    if (typeof option === 'object') {
        return option.value && option.value != ""
    }

    return option != ""
}

function MultiSelectWidget(props) {
    const { id, placeholder, required, disabled, readonly, autofocus, value, options, onChange } = props
    const [ tagify, setTagify ] = useState(null)

    const inputEl = useRef(null)

    useEffect(() => {
        if (tagify) return

        let tagifyOptions = {
            whitelist: options.enumOptions.filter(optionHasValue) || [],
            enforceWhitelist: 'enforceEnumOptions' in options ? options.enforceEnumOptions : true,
            keepInvalidTags: 'keepInvalidTags' in options ? options.keepInvalidTags : true,
            dropdown: {
                enabled: 'dropdownEnabled' in options ? options.dropdownEnabled : 0,
                maxItems: 'maxOptions' in options ? options.maxOptions : 1000,
            },
            delimiters: null,
        }

        setTagify(new Tagify(inputEl.current, tagifyOptions))
    }, [inputEl, tagify, options.enumOptions])

    useEffect(() => {
        if (!tagify) return

        const handleTagsChanged = (event) => {
            let selectedItems = event.detail.tagify.value
            onChange(selectedItems.map(item => item.value))
        }

        tagify.on('add', handleTagsChanged)
        tagify.on('remove', handleTagsChanged)
        tagify.on('dropdown:select', handleTagsChanged)
    }, [tagify, onChange])

    useEffect(() => {
        if (!tagify) return

        tagify.settings.whitelist = options.enumOptions.filter(optionHasValue)
    }, [tagify, options.enumOptions])
 
    // make sure passed in value is an array
    let filteredValues = value || []

    if (typeof filteredValues === 'string') {
        filteredValues = filteredValues.split(',')
    }

    // make sure passed in value matches the array of objects format
    filteredValues = filteredValues.map(filteredValue => typeof filteredValue === 'string' ? { value: filteredValue } : filteredValue)

    return (
        <input
            ref={inputEl}
            className="form-input-control"
            id={id}
            placeholder={placeholder}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus || false}
            defaultValue={JSON.stringify(filteredValues)}
        />
    )
}

export default MultiSelectWidget
