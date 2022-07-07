import React from 'react'

export default function IconButton(props) {
    const { type = 'default', icon, className, children, ...otherProps } = props
    return (
        <button
            type="button"
            className={`btn btn-${type} ${className || ''}`}
            {...otherProps}
        >
            <i
                className={`fas fa-${icon}`}
                style={{
                    marginRight: `${children && children.length ? '5px' : 0}`,
                }}
            />

            {children}
        </button>
    )
}
