import React, { useState, useEffect, useCallback } from 'react'
import { getDefaultRegistry } from '@rjsf/core'
import { MdWarning } from 'react-icons/md'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import type { FieldProps } from '@rjsf/utils'

/**
 * Custom StringField that wraps RJSF's StringField to add link validation and HTML auto-detection
 * @param props - The FieldProps for this field
 */
function StringField(props: FieldProps) {
    const [linkIsValid, setLinkIsValid] = useState<boolean | null>(null)
    const { StringField: RJSFStringField } = getDefaultRegistry().fields
    const formContext = props.registry?.formContext || {}

    // force the HtmlTextWidget if the field's value contains HTML (so it can render)
    const fieldProps = { ...props }
    try {
        if (
            typeof props.formData === 'string' &&
            props.formData.indexOf('</') >= 0 &&
            !props?.uiSchema?.['ui:widget']
        ) {
            fieldProps.uiSchema = {
                ...fieldProps.uiSchema,
                'ui:widget': 'htmltext',
            }
        }
    } catch (err) {}

    const validateNoBrokenLinks = useCallback(() => {
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

        if (!formContext.linkCheckerApiUrl) {
            // no link checker API URL configured, don't check URLs!
            return
        }

        // ok we have a valid URL, let's test it

        let apiUrl =
            formContext.linkCheckerApiUrl +
            (formContext.linkCheckerApiUrl.substr(-1) != '/' ? '/' : '')

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
                }
            })
            .catch(err => {
                console.error('Link validation error:', err)
            })
    }, [
        props.schema?.format,
        props.formData,
        props.rawErrors,
        formContext.linkCheckerApiUrl,
    ])

    useEffect(() => {
        validateNoBrokenLinks()
    }, [props.formData, validateNoBrokenLinks])

    useEffect(() => {
        if (linkIsValid === null || !props.name) return

        let brokenLinks: Record<string, string> = {}

        if (localStorage.getItem('brokenLinks')) {
            try {
                brokenLinks = JSON.parse(localStorage.getItem('brokenLinks') || '{}')
            } catch {
                brokenLinks = {}
            }
        }

        brokenLinks[props.name] = linkIsValid.toString()

        localStorage.setItem('brokenLinks', JSON.stringify(brokenLinks))
    }, [linkIsValid, props.name])

    const handleBlur = useCallback(
        (id: string, value: any) => {
            validateNoBrokenLinks()

            if (props.onBlur) {
                props.onBlur(id, value)
            }
        },
        [validateNoBrokenLinks, props]
    )

    return (
        <>
            <RJSFStringField {...fieldProps} onBlur={handleBlur} />

            {linkIsValid === false && (
                <div className="field-warning">
                    <OverlayTrigger
                        placement="left"
                        delay={{ show: 150, hide: 400 }}
                        overlay={overlayProps => (
                            <Tooltip
                                id={`broken-link-tooltip-${fieldProps.name}`}
                                {...overlayProps}
                            >
                                URL doesn&apos;t exist
                            </Tooltip>
                        )}
                    >
                        <div>
                            <MdWarning />
                        </div>
                    </OverlayTrigger>
                </div>
            )}
        </>
    )
}

export default StringField
