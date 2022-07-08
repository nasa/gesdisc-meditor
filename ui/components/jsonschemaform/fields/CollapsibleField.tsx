// @ts-nocheck
/**
 * react-jsonschema-form-extras CollapsibleField
 * refactored for RJSF v2, original https://github.com/RXNT/react-json-schema-form-extras
 *
 * TODO: refactor to functional components, fix TS issues, and remove ts-nocheck
 */
import React, { Component } from 'react'
import { utils } from '@rjsf/core'
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md'
import { keyExistsInSchema } from '../../../lib/utils'

class CollapseMenuAction extends Component {
    render() {
        let { action, allActions = {} } = this.props
        if (!action) {
            return null
        }
        if (typeof action === 'string') {
            return <div>{action}</div>
        } else if (typeof action === 'object') {
            const Component = allActions[action.component]
            if (!Component) {
                console.error(
                    `Can't find ${action.component} in formContext.allActions`
                )
                return (
                    <h2 className="warning bg-error" style={{ color: 'red' }}>
                        Can't find <b>{action.component}</b> in <b>formContext</b>.
                        <b>allActions</b>
                    </h2>
                )
            }
            return <Component {...action.props} />
        }
    }
}

function CollapseMenu(props) {
    let {
        uiSchema: {
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
            },
        },
        formContext = {},
        onChange,
        onAdd,
        title,
        name,
        collapsed,
    } = props

    const handleAdd = event => {
        event.stopPropagation()
        onAdd(event)
    }

    const iconStyle = {
        color: collapseGlyphColor,
        padding: glyphPadding,
    }

    const iconSize = collapseGlyphFontSize

    return (
        <div
            className={`${wrapClassName}`}
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
                        <MdKeyboardArrowUp size={iconSize} style={iconStyle} />
                    ) : (
                        <MdKeyboardArrowDown size={iconSize} style={iconStyle} />
                    )}
                </a>
                <span>{title || name}</span>
                {props.required && <span className="required">*</span>}&nbsp;
                {addTo && (
                    <a
                        onClick={handleAdd}
                        style={{ color: addGlyphColor, cursor: addCursor }}
                    >
                        <i style={{ cursor: addCursor }} className={add} />
                    </a>
                )}
                {actions.map((action, i) => (
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

class CollapseLegend extends Component {
    render() {
        let {
            uiSchema: {
                collapse: { legend },
            },
            formContext: { legends = {} } = {},
        } = this.props
        if (!legend) {
            return null
        }
        if (typeof legend === 'string') {
            return <div>{legend}</div>
        } else if (typeof legend === 'object') {
            const Component = legends[legend.component]
            if (!Component) {
                console.error(
                    `Can't find ${legend.components} in formContext.legends`
                )
                return (
                    <h2 className="warning bg-error" style={{ color: 'red' }}>
                        Can't find <b>{legend.component}</b> in <b>formContext</b>.
                        <b>legends</b>
                    </h2>
                )
            }
            return <Component {...legend.props} />
        }
        return <div>I'm a legend</div>
    }
}

class CollapsibleField extends Component {
    constructor(props) {
        super(props)

        let {
            uiSchema: { collapse: { collapsed = true } = {} },
        } = props

        this.state = { collapsed }
    }

    componentDidMount() {
        window.addEventListener('expandall', this.expandAll.bind(this))
        window.addEventListener('collapseall', this.collapseAll.bind(this))
    }

    componentWillUnmount() {
        window.removeEventListener('expandall', this.expandAll.bind(this))
        window.removeEventListener('collapseall', this.collapseAll.bind(this))
    }

    expandAll() {
        this.setState({ collapsed: false })
    }

    collapseAll() {
        this.setState({ collapsed: true })
    }

    appendToArray = (formData = [], newVal) => {
        let {
            uiSchema: { collapse: { addToBottom = true } = {} },
        } = this.props
        if (formData.some(v => utils.deepEquals(v, newVal))) {
            return formData
        } else {
            // newVal can be either array or a single element, concat flattens value
            if (addToBottom) {
                return formData.concat(newVal)
            } else {
                return [newVal].concat(formData)
            }
        }
    }

    doAdd = (field, formData, newVal) => {
        if (field === 'self') {
            this.props.onChange(this.appendToArray(formData, newVal))
        } else {
            let fieldVal = this.appendToArray(formData[field], newVal)
            let change = Object.assign({}, formData, { [field]: fieldVal })
            this.props.onChange(change)
        }
    }

    handleAdd = () => {
        this.setState({ collapsed: false })
        this.forceUpdate(() => {
            let {
                schema,
                uiSchema,
                formData,
                registry: { fields },
            } = this.props
            let {
                collapse: { addTo, addElement },
            } = uiSchema

            let fieldSchema =
                addTo === 'self'
                    ? schema.items
                    : schema.properties
                    ? schema.properties[addTo]
                        ? schema.properties[addTo].items
                        : null
                    : null
            if (!fieldSchema) {
                return false
            }
            let fieldUiSchema = addTo === 'self' ? uiSchema : uiSchema[addTo]

            if (addElement) {
                if (typeof addElement === 'function') {
                    let onSubmit = newVal => {
                        this.setState({ AddElement: undefined })
                        this.doAdd(addTo, formData, newVal)
                    }
                    let AddElement = addElement(fieldSchema, fieldUiSchema, onSubmit)
                    this.setState({ AddElement })
                } else {
                    let FieldElement = fields[addElement]
                    let onBlur = newVal => {
                        this.setState({ AddElement: undefined })
                        this.doAdd(addTo, formData, newVal)
                    }
                    let AddElement = () => (
                        <FieldElement
                            schema={fieldSchema}
                            uiSchema={fieldUiSchema}
                            onChange={formData => {
                                onBlur(formData)
                            }}
                        />
                    )
                    this.setState({ AddElement })
                }
            } else {
                let newVal = utils.getDefaultFormState(fieldSchema, {})
                this.doAdd(addTo, formData, newVal)
            }
        })
    }

    handleCollapsed = () => {
        this.setState(function (state) {
            return { collapsed: !state.collapsed }
        })
    }

    render() {
        let {
            schema: { title },
            uiSchema,
            registry: { fields },
            idSchema: { $id } = {},
            name,
            formContext,
        } = this.props
        let { collapsed, AddElement } = this.state
        let {
            collapse: { field },
        } = uiSchema
        let CollapseElement = fields[field]
        // uischema retains the value form the state
        uiSchema.collapse.collapsed = this.state.collapsed

        title = uiSchema['ui:title'] ? uiSchema['ui:title'] : title ? title : name
        let customizedId = collapsed ? $id : undefined

        let required = keyExistsInSchema('required', this.props.schema)

        return (
            <div id={customizedId}>
                <CollapseMenu
                    title={title}
                    uiSchema={uiSchema}
                    collapsed={collapsed}
                    formContext={formContext}
                    onAdd={this.handleAdd}
                    onChange={this.handleCollapsed}
                    required={required}
                />
                <div className={`form-group ${collapsed && 'collapsed'}`}>
                    {AddElement && <AddElement />}
                    <CollapseLegend {...this.props} />
                    <CollapseElement {...this.props} />
                </div>
            </div>
        )
    }
}

export default CollapsibleField
