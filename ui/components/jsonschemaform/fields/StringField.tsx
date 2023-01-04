import React, { useState, useEffect } from 'react'
import { default as RJSFStringField } from '@rjsf/core/lib/components/fields/StringField'
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
                'ui:widget': 'htmltext',
            }
        }
    } catch (err) {}

    useEffect(() => {
        validateNoBrokenLinks()
    }, [])

    useEffect(() => {
        if (linkIsValid === null) return

        let brokenLinks = {}

        if (localStorage.getItem('brokenLinks')) {
            brokenLinks = JSON.parse(localStorage.getItem('brokenLinks'))
        }

        brokenLinks[props.name] = linkIsValid.toString()

        localStorage.setItem('brokenLinks', JSON.stringify(brokenLinks))
    }, [linkIsValid])

    function validateNoBrokenLinks() {
        let urlFields = ['uri', 'uri-reference', 'url']

        if (!props?.schema?.format || urlFields.indexOf(props.schema.format) < 0) {
            // this isn't a URL field
            return
        }

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

        let apiUrl =
            props.formContext.linkCheckerApiUrl +
            (props.formContext.linkCheckerApiUrl.substr(-1) != '/' ? '/' : '')

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: props.formData,
            }),
        })
            .then(response => response.json())
            .then(response => {
                if (response.isValid) {
                    setLinkIsValid(true)
                } else {
                    setLinkIsValid(false)
                    console.debug(response.data.validLink.message)
                }
            })
    }

    function handleBlur(args) {
        validateNoBrokenLinks()

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
                        overlay={props => (
                            <Tooltip
                                id={`broken-link-tooltip-${fieldProps.name}`}
                                {...props}
                            >
                                URL doesn&apos;t exist
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
