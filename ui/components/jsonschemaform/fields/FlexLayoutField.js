import React from 'react'

function FlexLayoutField({ TitleField, properties, title, description }) {
    return (
        <div className="container-fluid">
            <div className="row">
                <TitleField title={title} />
            </div>

            <div className="row">
                <div dangerouslySetInnerHTML={{ __html: description }} />
            </div>
            
            <div className="row">
                {properties.map(prop => {
                    return prop.content
                })}
            </div>
        </div>
    )
}

export default FlexLayoutField
