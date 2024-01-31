import React from 'react'
import type { ObjectFieldTemplateProps } from '@rjsf/utils'
import { getTemplate } from '@rjsf/utils'

export default function FlexLayoutTemplate(props: ObjectFieldTemplateProps) {
    // title field is no longer passed into ObjectFieldTemplates, you have to request it using "getTemplate"
    // https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/utility-functions/#gettemplatename-extends-keyof-templatestypet-s-f-t--any-s-extends-strictrjsfschema--rjsfschema-f-extends-formcontexttype--any
    const TitleField = getTemplate('TitleFieldTemplate', props.registry)

    return (
        <div className="container-fluid">
            <div className="row">
                <TitleField {...props} id={props.idSchema.$id} />
            </div>

            <div className="row">
                {props.properties.map(prop => {
                    return prop.content
                })}
            </div>
        </div>
    )
}
