import React, { useState, useEffect } from 'react'

const DEFAULT_DELIMETER = ' > '
const ID_PREFIX = 'root_'

function ConcatenatedWidget(props) {
    const { BaseInput } = props.registry.widgets

    const delimeter = props.options.delimeter || DEFAULT_DELIMETER

    const [concatenatedValue, setConcatenatedValue] = useState(props.value)

    // update our local store from the passed in value
    useEffect(() => setConcatenatedValue(props.value), [props.value])

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
                    let newValue = fields.map((field) => field.value)

                    // finally, set the value to the concatenated value of all the fields!
                    setConcatenatedValue(newValue.join(delimeter))
                }
            })
        }, 500)
    }

    return (
        <BaseInput
            value={concatenatedValue}
            options={props.options}
            id={props.id}
            schema={props.schema}
            type="text"
            readonly={true}
        />
    )
}

export default ConcatenatedWidget
