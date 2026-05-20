/**
 * react-jsonschema-form-extras CollapsibleField
 * refactored for RJSF v6
 * original: https://github.com/RXNT/react-json-schema-form-extras
 */
import React, { useState, useEffect, useCallback } from 'react'
import { deepEquals, getDefaultFormState, FieldProps } from '@rjsf/utils'
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md'
import { keyExistsInSchema } from '../../../lib/utils'

interface CollapseMenuActionProps {
    action?: string | { component: string; props?: any }
    allActions?: Record<string, React.ComponentType<any>>
}

function CollapseMenuAction({ action, allActions = {} }: CollapseMenuActionProps) {
    if (!action) {
        return null
    }
    if (typeof action === 'string') {
        return <div>{action}</div>
    } else if (typeof action === 'object') {
        const Component = allActions[action.component]
        if (!Component) {
            console.error(`Can't find ${action.component} in formContext.allActions`)
            return (
                <h2 className="warning bg-error" style={{ color: 'red' }}>
                    Can&apos;t find <b>{action.component}</b> in <b>formContext</b>.
                    <b>allActions</b>
                </h2>
            )
        }
        return <Component {...action.props} />
    }
    return null
}

interface CollapseMenuProps {
    uiSchema: any
    formContext: any
    onChange: () => void
    onAdd: (event: React.MouseEvent) => void
    title?: string
    name?: string
    collapsed: boolean
    required?: boolean
}

function CollapseMenu({
    uiSchema,
    formContext = {},
    onChange,
    onAdd,
    title,
    name,
    collapsed,
    required,
}: CollapseMenuProps) {
    const {
        collapse: {
            icon: {
                enabled = 'glyphicon glyphicon-chevron-down',
                disabled = 'glyphicon glyphicon-chevron-right',
                add = 'glyphicon glyphicon-plus-sign',
            } = {},
            separate = false,
            addTo,
            wrapClassName = 'lead collapsible-section',
            actions = [],
            classNames = 'collapsible-heading',
            collapseDivStyles: {
                collapseGlyphColor = 'black',
                collapseGlyphFontSize = '32px',
                addGlyphColor = 'black',
                glyphPadding = '0 10px 0 0',
                padding = '14px 0 14px 0',
                margin = '',
                marginLeft = '-5px',
                marginBottom = '5px',
                zIndex = -1,
                divCursor = 'pointer',
                addCursor = 'copy',
                leadFontWeight = '400',
            } = {},
        } = {},
    } = uiSchema

    const handleAdd = (event: React.MouseEvent) => {
        event.stopPropagation()
        onAdd(event)
    }

    const iconStyle: React.CSSProperties = {
        color: collapseGlyphColor,
        padding: glyphPadding,
    }

    return (
        <div
            className={wrapClassName}
            style={{
                fontWeight: leadFontWeight,
            }}
        >
            <div
                className={classNames}
                onClick={onChange}
                style={{
                    padding,
                    margin,
                    marginLeft,
                    marginBottom,
                    zIndex,
                    cursor: divCursor,
                }}
            >
                <a>
                    {collapsed ? (
                        <MdKeyboardArrowUp
                            size={collapseGlyphFontSize}
                            style={iconStyle}
                        />
                    ) : (
                        <MdKeyboardArrowDown
                            size={collapseGlyphFontSize}
                            style={iconStyle}
                        />
                    )}
                </a>
                <span>{title || name}</span>

                {addTo && (
                    <a
                        onClick={handleAdd}
                        style={{ color: addGlyphColor, cursor: addCursor }}
                    >
                        <i style={{ cursor: addCursor }} className={add} />
                    </a>
                )}
                {actions.map((action: any, i: number) => (
                    <CollapseMenuAction
                        key={i}
                        action={action}
                        allActions={formContext.allActions}
                    />
                ))}
            </div>

            {separate && <hr />}
        </div>
    )
}

interface CollapseLegendProps {
    uiSchema: any
    registry: any
}

function CollapseLegend({ uiSchema, registry }: CollapseLegendProps) {
    const formContext = registry?.formContext || {}
    const { collapse: { legend } = {} } = uiSchema

    if (!legend) {
        return null
    }
    if (typeof legend === 'string') {
        return <div>{legend}</div>
    } else if (typeof legend === 'object') {
        const { legends = {} } = formContext
        const Component = legends[legend.component]
        if (!Component) {
            console.error(`Can't find ${legend.component} in formContext.legends`)
            return (
                <h2 className="warning bg-error" style={{ color: 'red' }}>
                    Can&apos;t find <b>{legend.component}</b> in <b>formContext</b>.
                    <b>legends</b>
                </h2>
            )
        }
        return <Component {...legend.props} />
    }
    return <div>I&apos;m a legend</div>
}

function CollapsibleField(props: FieldProps) {
    const { schema, uiSchema, formData, registry, fieldPathId, name, onChange } =
        props

    const { fields, formContext = {} } = registry
    const initialCollapsed = uiSchema?.collapse?.collapsed ?? true
    const [collapsed, setCollapsed] = useState(initialCollapsed)
    const [AddElement, setAddElement] = useState<React.ComponentType | null>(null)

    // Event handlers for expand/collapse all
    useEffect(() => {
        const handleExpandAll = () => setCollapsed(false)
        const handleCollapseAll = () => setCollapsed(true)

        window.addEventListener('expandall', handleExpandAll)
        window.addEventListener('collapseall', handleCollapseAll)

        return () => {
            window.removeEventListener('expandall', handleExpandAll)
            window.removeEventListener('collapseall', handleCollapseAll)
        }
    }, [])

    const appendToArray = useCallback(
        (data: any[] = [], newVal: any) => {
            const addToBottom = uiSchema?.collapse?.addToBottom ?? true

            if (data.some(v => deepEquals(v, newVal))) {
                return data
            }

            // newVal can be either array or a single element, concat flattens value
            return addToBottom ? data.concat(newVal) : [newVal].concat(data)
        },
        [uiSchema]
    )

    const doAdd = useCallback(
        (field: string, data: any, newVal: any) => {
            const path = fieldPathId?.path || []

            if (field === 'self') {
                onChange(appendToArray(data, newVal), path)
            } else {
                const fieldVal = appendToArray(data[field], newVal)
                onChange(fieldVal, [...path, field])
            }
        },
        [fieldPathId, onChange, appendToArray]
    )

    const handleAdd = useCallback(() => {
        setCollapsed(false)

        // Use setTimeout to ensure state update has taken effect
        setTimeout(() => {
            const { addTo, addElement } = uiSchema.collapse || {}

            let fieldSchema: any =
                addTo === 'self'
                    ? schema.items
                    : schema.properties?.[addTo]
                    ? (schema.properties[addTo] as any)?.items
                    : null

            if (!fieldSchema) {
                return
            }

            const fieldUiSchema = addTo === 'self' ? uiSchema : uiSchema[addTo]

            if (addElement) {
                if (typeof addElement === 'function') {
                    const onSubmit = (newVal: any) => {
                        setAddElement(null)
                        doAdd(addTo, formData, newVal)
                    }
                    const element = addElement(fieldSchema, fieldUiSchema, onSubmit)
                    setAddElement(() => element)
                } else {
                    const FieldElement = fields[addElement]
                    const onBlur = (newVal: any) => {
                        setAddElement(null)
                        doAdd(addTo, formData, newVal)
                    }
                    setAddElement(() => () => (
                        <FieldElement
                            {...props}
                            schema={fieldSchema}
                            uiSchema={fieldUiSchema}
                            onChange={(value: any) => onBlur(value)}
                        />
                    ))
                }
            } else {
                const newVal = getDefaultFormState(fieldSchema, {})
                doAdd(addTo, formData, newVal)
            }
        }, 0)
    }, [uiSchema, schema, formData, fields, doAdd])

    const handleCollapsed = useCallback(() => {
        setCollapsed(prev => !prev)
    }, [])

    const { field } = uiSchema?.collapse || {}
    const CollapseElement = fields?.[field]
    const title = uiSchema['ui:title'] || schema.title || name
    const customizedId = collapsed ? fieldPathId?.$id : undefined
    const required = keyExistsInSchema('required', schema)

    // Update uiSchema collapsed state (for external tracking if needed)
    if (uiSchema?.collapse) {
        uiSchema.collapse.collapsed = collapsed
    }

    if (!CollapseElement) {
        console.error(`CollapsibleField: field "${field}" not found in registry`)
        return null
    }

    return (
        <div id={customizedId}>
            <CollapseMenu
                title={title}
                uiSchema={uiSchema}
                collapsed={collapsed}
                formContext={formContext}
                onAdd={handleAdd}
                onChange={handleCollapsed}
                required={required}
            />
            <div className={`form-group ${collapsed ? 'collapsed' : ''}`}>
                {AddElement && <AddElement />}
                <CollapseLegend uiSchema={uiSchema} registry={registry} />
                <CollapseElement {...props} />
            </div>
        </div>
    )
}

export default CollapsibleField
