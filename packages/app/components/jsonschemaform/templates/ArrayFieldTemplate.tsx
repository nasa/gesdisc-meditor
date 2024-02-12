import {
    getTemplate,
    getUiOptions,
    ArrayFieldTemplateProps,
    ArrayFieldTemplateItemType,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils'
import AddButton from '../components/AddButton'

/** The `ArrayFieldTemplate` component is the template used to render all items in an array.
 * This was created for mEditor use from the original ArrayFieldTemplate: https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/templates/ArrayFieldTemplate.tsx
 */
export default function ArrayFieldTemplate<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: ArrayFieldTemplateProps<T, S, F>) {
    const uiOptions = getUiOptions<T, S, F>(props.uiSchema)
    const ArrayFieldDescriptionTemplate = getTemplate<
        'ArrayFieldDescriptionTemplate',
        T,
        S,
        F
    >('ArrayFieldDescriptionTemplate', props.registry, uiOptions)
    const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
        'ArrayFieldItemTemplate',
        props.registry,
        uiOptions
    )
    const ArrayFieldTitleTemplate = getTemplate<'ArrayFieldTitleTemplate', T, S, F>(
        'ArrayFieldTitleTemplate',
        props.registry,
        uiOptions
    )

    return (
        <fieldset className={props.className} id={props.idSchema.$id}>
            <ArrayFieldTitleTemplate
                idSchema={props.idSchema}
                title={uiOptions.title || props.title}
                required={props.required}
                schema={props.schema}
                uiSchema={props.uiSchema}
                registry={props.registry}
            />
            <ArrayFieldDescriptionTemplate
                idSchema={props.idSchema}
                description={uiOptions.description || props.schema.description}
                schema={props.schema}
                uiSchema={props.uiSchema}
                registry={props.registry}
            />
            <div className="row array-item-list">
                {props.items &&
                    props.items.map(
                        ({
                            key,
                            ...itemProps
                        }: ArrayFieldTemplateItemType<T, S, F>) => (
                            <ArrayFieldItemTemplate key={key} {...itemProps} />
                        )
                    )}
            </div>

            {props.canAdd && (
                <AddButton
                    title={props.uiSchema['ui:title'] || props.title}
                    className="array-item-add"
                    onClick={props.onAddClick}
                    disabled={props.disabled || props.readonly}
                />
            )}
        </fieldset>
    )
}
