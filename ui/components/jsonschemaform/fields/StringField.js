import React from 'react'
import { default as RJSFStringField } from 'react-jsonschema-form/lib/components/fields/StringField'

/**
 * overrides the original StringField to add custom features
 * @param {*} props
 */
function StringField(props) {
    console.log(props)

    function validateNoBrokenLinks() {
        if (!props.formData) {
            // user hasn't filled out the field yet
            return
        }

        if (props.rawErrors && props.rawErrors.length) {
            // this isn't a valid URL, wait for user to input a valid URL before testing
            return
        }

        if (!props.formContext.linkCheckerApiUrl) {
            // no link checker API URL configured, don't check URLs!
            return
        }

        // ok we have a valid URL, let's test it
        
        fetch(props.formContext.linkCheckerApiUrl + props.formData.replace('https://', '').replace('http://', ''), {
            method: 'HEAD',
        })
            .then(response => {
                if (!response.ok) {
                    console.log('failed!')
                }
            })
    }

    function handleBlur(a, b, c) {
        let fieldFormat = props.schema.format

        if (fieldFormat && (fieldFormat === 'uri' || fieldFormat === 'url')) {
            validateNoBrokenLinks()
        }

        if (props.onBlur) {
            props.onBlur()
        }
    }

    return <RJSFStringField {...props} onBlur={handleBlur} />
}

export default StringField
