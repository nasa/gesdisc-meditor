import type {
    DescriptionFieldProps,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils'
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { FaQuestionCircle } from 'react-icons/fa'

/**
 * The `DescriptionField` is the template to use to render the description of a field
 */
export default function DescriptionFieldTemplate<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: DescriptionFieldProps<T, S, F>) {
    if (!props.description) {
        return null
    }

    return (
        <OverlayTrigger
            placement="top"
            overlay={overlayProps => (
                <Tooltip id="description-tooltip" {...overlayProps}>
                    {props.description}
                </Tooltip>
            )}
        >
            <span className="d-inline-block">
                <FaQuestionCircle className="mr-2" style={{ cursor: 'pointer' }} />
            </span>
        </OverlayTrigger>
    )
}
