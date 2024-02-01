import React from 'react'
import type { ObjectFieldTemplateProps } from '@rjsf/utils'
import { getTemplate } from '@rjsf/utils'

export default function FlexLayoutTemplate(props: ObjectFieldTemplateProps) {
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
