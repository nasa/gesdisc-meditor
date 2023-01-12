import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import styles from './icon-button.module.css'

function renderTooltip(props: any, alt: string) {
    return (
        <Tooltip {...props} id={`icon-button-${alt.replace(/ /gi, '').toLowerCase()}-tooltip`}>
            {alt}
        </Tooltip>
    )
}

const IconButton = ({
    children,
    alt,
    variant = 'light',
    tooltipPlacement = 'top',
    showTooltip = true,
    onClick = () => {},
    type = null,
}) => {
    let buttonProps: any = {
        variant,
    }

    let overlayProps: any = {
        placement: tooltipPlacement,
    }

    function renderButton() {
        return (
            <Button {...buttonProps} className={styles.button} onClick={onClick} type={type}>
                {children}

                <span className="sr-only">{alt}</span>
            </Button>
        )
    }

    if (!showTooltip) {
        return renderButton()
    }

    return (
        <OverlayTrigger
            {...overlayProps}
            delay={{ show: 100, hide: 100 }}
            overlay={(props) => renderTooltip(props, alt)}
        >
            {renderButton()}
        </OverlayTrigger>
    )
}

export default IconButton
