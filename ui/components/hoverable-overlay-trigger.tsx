import Popover from 'react-bootstrap/Popover'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { useState } from 'react'

const DEFAULT_SHOW_DELAY_MILLIS = 100
const DEFAULT_HIDE_DELAY_MILLIS = 100
const LONG_HIDE_DELAY_MILLIS = 60 * 1000 * 1000

/**
 * the OverlayTrigger doesn't allow for interaction inside of the popover (when using hover)
 * HoverableOverlayTrigger handles this by capturing hover events on the popover and adding an artificial hide delay while hover is still active
 */
export const HoverableOverlayTrigger = ({ placement, overlay, children }) => {
    const [hideDelay, setHideDelay] = useState(DEFAULT_HIDE_DELAY_MILLIS)

    return (
        <OverlayTrigger
            placement={placement}
            overlay={overlay}
            delay={{ show: DEFAULT_SHOW_DELAY_MILLIS, hide: hideDelay }}
        >
            {children}
        </OverlayTrigger>
    )
}

export const PublishingPopover = (
    <Popover id="publishing">
        <Popover.Title as="h3">In progress</Popover.Title>
        <Popover.Content>Awaiting response from subscribers</Popover.Content>
    </Popover>
)
