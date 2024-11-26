import type { WidgetProps } from '@rjsf/utils'
import { useEffect, useState } from 'react'
import { findAndReplace, macros } from './utils'

/**
 * Schema Layout:
    "MyProperty": {
        "ui:widget": "anchor",
        "ui:options": {
            "href": "http://localhost:8080/service-request-from-config?variable_entry_id=******",
            "text": "",
            "change": {
                "every": "***",
                "to": ["FIELD_LOOKUP:EntryID", "FIELD_LOOKUP:VariableEntryID"] // replace with no regex, not replaceAll, is used. This means you can stack "every" to replace per "to" field.
            } 
        }
    },
 */
export default function AnchorWidget({ options }: WidgetProps) {
    const [href, setHref] = useState(options.href as string)

    useEffect(() => {
        // @ts-expect-error
        if (!!options.change.every) {
            setHref(
                findAndReplace(
                    options.href as string,
                    // @ts-expect-error
                    options.change.every as string,
                    // @ts-expect-error
                    options.change.to as string[],
                    macros
                )
            )
        }
        // @ts-expect-error
    }, [options.href, options.change.every, options.change.to, setHref])

    return (
        <a href={href} target="_blank" rel="noopener noreferrer">
            <>{options.text || href}</>
        </a>
    )
}
