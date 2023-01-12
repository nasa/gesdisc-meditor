import React from 'react'
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { FaQuestionCircle } from 'react-icons/fa'

/**
 * overrides the original DescriptionField to add custom features
 * @param {*} props
 */
function DescriptionField(props) {
    if (!props.description) {
        return <></>
    }

    let description = props.description

    return (
        <OverlayTrigger
            placement="top"
            overlay={props => (
                <Tooltip id="description-tooltip" {...props}>
                    {description}
                </Tooltip>
            )}
        >
            <FaQuestionCircle />
        </OverlayTrigger>
    )
}

export default DescriptionField
