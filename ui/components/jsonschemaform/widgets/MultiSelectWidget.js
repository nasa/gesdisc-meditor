import React, { useRef, useEffect, useState } from 'react'
import Tagify from '@yaireo/tagify'

// required tagify options, these shouldn't be changed as they change the expected functionality of the multi-select
// if you need to add a new one
const TAGIFY_OPTIONS = {
    whitelist: [],
    enforceWhitelist: true,
    dropdown: {
        enabled: 0,
        maxItems: 1000,
    }
}

function MultiSelectWidget(props) {
    const { id, placeholder, required, disabled, readonly, autofocus, value, options, onChange } = props
    const [ tagify, setTagify ] = useState(null)

    const inputEl = useRef(null)

    useEffect(() => {
        if (tagify) return

        setTagify(new Tagify(inputEl.current, Object.assign({}, TAGIFY_OPTIONS, {
            whitelist: options.enumOptions,
        }))) 
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

        tagify.settings.whitelist = options.enumOptions
    }, [tagify, options.enumOptions])
    
    return (
        <input
            ref={inputEl}
            className="form-input-control"
            id={id}
            placeholder={placeholder}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus || false}
            defaultValue={value}
        />
    )
}

export default MultiSelectWidget
