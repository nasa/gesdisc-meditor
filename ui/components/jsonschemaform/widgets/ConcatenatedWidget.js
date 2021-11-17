import React, { useState, useEffect } from 'react'

const DEFAULT_DELIMETER = ' > '
const ID_PREFIX = 'root_'

function ConcatenatedWidget(props) {
    const { BaseInput } = props.registry.widgets

    const delimeter = props.options.delimeter || DEFAULT_DELIMETER

    const [concatenatedValue, setConcatenatedValue] = useState(props.value)

    // update our local store from the passed in value
    useEffect(() => setConcatenatedValue(props.value), [props.value])

    /**
     * finds a field's value
     * 
     * a field's value can be in one of 3 states (using 3rd party widgets so we can't enforce a specific standard):
     * - "foo": a plain string
     * - "{"label": "field label", "value": "foo"}": a JSON stringifed label/value
     * - {"label": "field label", "value": "foo"}: an object label/value
     * @param {*} field 
     */
    function getFieldValue(field) {
        let fieldValue
        
        try {
            // parse embedded JSON string
            fieldValue = JSON.parse(field.value)
        } catch(err) {
            // value is not JSON, grab it directly
            fieldValue = field.value
        }
    
        if (typeof fieldValue === 'object' && 'value' in fieldValue) {
            // value is an object that contains a value property
            fieldValue = fieldValue.value
        }

        return fieldValue
    }

    // if fields are provided, listen for the blur on each, then concatenate all the values of the fields together
    // and that will be the value of THIS field
    if (props.options.fields) {
        setTimeout(() => {
            let fields = []

            props.options.fields.forEach(field => {
                let el = document.getElementById(ID_PREFIX + field)

                if (!el) {
                    console.error(`Cannot concatenate using field: '${field}'. That field was not found in this document.`)
                    return
                }

                fields.push(el)

                el.onblur = function (e) {
                    let newValue = fields.map(getFieldValue).join(delimeter)

                    // finally, set the value to the concatenated value of all the fields!
                    setConcatenatedValue(newValue)
                    props.onChange(newValue)
                }
            })
        }, 500)
    }

    return (
        <BaseInput
            {...props}
            value={concatenatedValue}
            readonly={true}
        />
    )
}

export default ConcatenatedWidget
