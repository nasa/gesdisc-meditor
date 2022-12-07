import { useRef, useEffect } from 'react'

const CodeEditor = props => {
    const el = useRef(null)

    function handleTextChange(event) {
        props.onTextChange(event.detail)
    }

    useEffect(() => {
        const codeEditorEl = el.current

        // bind custom element events to prop
        codeEditorEl?.addEventListener('textChange', handleTextChange)

        return () => {
            codeEditorEl?.removeEventListener('textChange', handleTextChange)
        }
    }, [el])

    return <code-editor {...props} ref={el}></code-editor>
}

export default CodeEditor
