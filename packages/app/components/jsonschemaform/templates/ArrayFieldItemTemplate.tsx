import type { CSSProperties } from 'react'
import type {
    ArrayFieldItemTemplateProps,
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
>(props: ArrayFieldItemTemplateProps<T, S, F>) {
    const { children, className, disabled, hasToolbar, buttonsProps, readonly } =
        props
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
                        {(buttonsProps.hasMoveUp || buttonsProps.hasMoveDown) && (
                            <IconButton
                                icon="arrow-up"
                                aria-label="Move up"
                                className="array-item-move-up"
                                tabIndex="-1"
                                style={btnStyle}
                                disabled={
                                    disabled || readonly || !buttonsProps.hasMoveUp
                                }
                                onClick={buttonsProps.onMoveUpItem}
                            />
                        )}
                        {(buttonsProps.hasMoveUp || buttonsProps.hasMoveDown) && (
                            <IconButton
                                icon="arrow-down"
                                className="array-item-move-down"
                                aria-label="Move down"
                                tabIndex="-1"
                                style={btnStyle}
                                disabled={
                                    disabled || readonly || !buttonsProps.hasMoveDown
                                }
                                onClick={buttonsProps.onMoveDownItem}
                            />
                        )}
                        {buttonsProps.hasCopy && (
                            <IconButton
                                icon="copy"
                                aria-label="Copy Item"
                                tabIndex="-1"
                                style={btnStyle}
                                disabled={disabled || readonly}
                                onClick={buttonsProps.onCopyItem}
                            />
                        )}
                        {buttonsProps.hasRemove && (
                            <IconButton
                                type="danger"
                                icon="times"
                                aria-label="Remove"
                                className="array-item-remove"
                                tabIndex="-1"
                                style={btnStyle}
                                disabled={disabled || readonly}
                                onClick={buttonsProps.onRemoveItem}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
