import React, { useState, useEffect } from 'react'
import { default as RJSFStringField } from 'react-jsonschema-form/lib/components/fields/StringField'
import { MdWarning } from 'react-icons/md'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

/**
 * overrides the original StringField to add custom features
 * @param {*} props
 */
function StringField(props) {
    const [linkIsValid, setLinkIsValid] = useState(null)
    let fieldProps = { ...props }
   
    // force the HtmlTextWidget if the field's value contains HTML (so it can render)
    try {
        if (props.formData.indexOf('</') >= 0 && !props?.uiSchema?.['ui:widget']) {
            fieldProps.uiSchema = {
                ...fieldProps.uiSchema,
                'ui:widget': 'htmltext'
            }
        }
    } catch (err) {}

    useEffect(() => {
        if (linkIsValid === null) return

        let brokenLinks = localStorage.getItem('brokenLinks')

        if (brokenLinks) brokenLinks = JSON.parse(brokenLinks)
        else brokenLinks = {}
        
        brokenLinks[props.name] = linkIsValid.toString()

        localStorage.setItem('brokenLinks', JSON.stringify(brokenLinks))
    }, [linkIsValid])

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
        
        let apiUrl = props.formContext.linkCheckerApiUrl + (props.formContext.linkCheckerApiUrl.substr(-1) != '/' ? '/' : '')

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query { validLink(url:"${props.formData}") { isValid, message } }`
            })
        })
            .then(response => response.json())
            .then(response => {
                if (response.data.validLink.isValid) {
                    setLinkIsValid(true)
                } else {
                    setLinkIsValid(false)
                    console.debug(response.data.validLink.message)
                }
            })
    }

    function handleBlur(args) {
        let fieldFormat = props.schema.format

        if (fieldFormat && (fieldFormat === 'uri' || fieldFormat === 'url')) {
            setLinkIsValid(true)
            validateNoBrokenLinks()
        }

        if (props.onBlur) {
            props.onBlur(args)
        }
    }

    return (
        <>
            <RJSFStringField {...fieldProps} onBlur={handleBlur} />

            {linkIsValid === false && (
                <div className="field-warning">
                    <OverlayTrigger 
                        placement="left" 
                        delay={{ show: 150, hide: 400 }} 
                        overlay={(props) => (
                            <Tooltip {...props}>
                                URL doesn't exist
                            </Tooltip>
                        )}
                    >
                        <MdWarning />
                    </OverlayTrigger>
                </div>
            )}
        </>
    )
}

export default StringField
