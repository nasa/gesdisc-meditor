import React from 'react'
import IconButton from './IconButton'
import pluralize from 'pluralize'

export default function AddButton({ className, onClick, disabled, title }) {
    return (
        <div className="row">
            <p className={`col-xs-3 col-xs-offset-9 text-right ${className}`}>
                <IconButton
                    type="info"
                    icon="plus"
                    className="btn-add col-xs-12"
                    tabIndex="0"
                    onClick={onClick}
                    disabled={disabled}
                >
                    Add another {title && pluralize.singular(title)}
                </IconButton>
            </p>
        </div>
    )
}
