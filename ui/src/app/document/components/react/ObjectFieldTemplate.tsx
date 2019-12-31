// @ts-ignore
import React from 'react'

export class ObjectFieldTemplate extends React.Component {
    render(props: any) {
        return React.createElement(
            'div',
            null,
            `
            ${props.title}
            ${props.description}
            ${props.properties.map(
                (element: any) => `
                <div className="property-wrapper">
                    ${element.content}
                </div>
            `
            )}
        `
        )
    }
}
