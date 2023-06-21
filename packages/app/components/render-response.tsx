const RenderResponse = props => {
    if (props.loading) {
        return props.loadingComponent || <></>
    }

    if (props.error) {
        return props.errorComponent || <></>
    }

    return <>{props.children}</>
}

export default RenderResponse
