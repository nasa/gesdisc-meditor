import type { CSSProperties } from 'react'
import type {
    ArrayFieldTemplateItemType,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils'
import IconButton from '../components/IconButton'

/**
 * The `ArrayFieldItemTemplate` component is the template used to render an items of an array.
 */
export default function ArrayFieldItemTemplate<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: ArrayFieldTemplateItemType<T, S, F>) {
    const {
        children,
        className,
        disabled,
        hasToolbar,
        hasMoveDown,
        hasMoveUp,
        hasRemove,
        hasCopy,
        index,
        onCopyIndexClick,
        onDropIndexClick,
        onReorderClick,
        readonly,
        registry,
        uiSchema,
    } = props
    const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } =
        registry.templates.ButtonTemplates
    const btnStyle: CSSProperties = {
        flex: 1,
        paddingLeft: 6,
        paddingRight: 6,
        fontWeight: 'bold',
    }
    return (
        <div className={className}>
            <div className={hasToolbar ? 'col-xs-9' : 'col-xs-12'}>{children}</div>
            {hasToolbar && (
                <div className="col-xs-3 array-item-toolbox">
                    <div
                        className="btn-group"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                        }}
                    >
                        {(hasMoveUp || hasMoveDown) && (
                            <IconButton
                                icon="arrow-up"
                                aria-label="Move up"
                                className="array-item-move-up"
                                tabIndex="-1"
                                style={btnStyle}
                                disabled={disabled || readonly || !hasMoveUp}
                                onClick={onReorderClick(index, index - 1)}
                            />
                        )}
                        {(hasMoveUp || hasMoveDown) && (
                            <IconButton
                                icon="arrow-down"
                                className="array-item-move-down"
                                aria-label="Move down"
                                tabIndex="-1"
                                style={btnStyle}
                                disabled={disabled || readonly || !hasMoveDown}
                                onClick={onReorderClick(index, index + 1)}
                            />
                        )}
                        {hasCopy && (
                            <IconButton
                                icon="copy"
                                aria-label="Copy Item"
                                tabIndex="-1"
                                style={btnStyle}
                                disabled={disabled || readonly}
                                onClick={onCopyIndexClick(index)}
                            />
                        )}
                        {hasRemove && (
                            <IconButton
                                type="danger"
                                icon="times"
                                aria-label="Remove"
                                className="array-item-remove"
                                tabIndex="-1"
                                style={btnStyle}
                                disabled={disabled || readonly}
                                onClick={onDropIndexClick(index)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
