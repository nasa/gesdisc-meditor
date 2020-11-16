import { useRef, useEffect } from 'react'

const CodeEditor = (props) => {
    const el = useRef(null)

    function handleTextChange(event) {
        props.onTextChange(event.detail)
    }

    useEffect(() => {
        // bind custom element events to prop
        el.current.addEventListener('textChange', handleTextChange)

        return () => {
            el.current.removeEventListener('textChange', handleTextChange)
        }
    }, [el])

    return <code-editor {...props} ref={el}></code-editor>
}


export default CodeEditor
