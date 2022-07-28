import React from 'react'

function FlexLayoutTemplate({ TitleField, properties, title, description }) {
    return (
        <div className="container-fluid">
            <div className="row">
                <TitleField title={title} />
            </div>

            <div className="row">
                {properties.map(prop => {
                    return prop.content
                })}
            </div>
        </div>
    )
}

export default FlexLayoutTemplate
