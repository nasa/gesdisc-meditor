import Card from 'react-bootstrap/Card'
import React from 'react'
import styles from './source-dialog.module.css'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import { useState, useEffect } from 'react'
import CodeEditor from '../code-editor'
import cloneDeep from 'lodash.clonedeep'

function isValidJSON(str) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

const SourceDialog = ({ source, title, onChange }) => {
    const [currentSource, setCurrentSource] = useState({})
    const [newSource, setNewSource] = useState({})
    const [validJson, setValidJson] = useState(true)

    // anytime the source changes, update our internal state
    useEffect(() => {
        let currentSource = cloneDeep(source?.doc || {})
        delete currentSource['x-meditor']
        delete currentSource._id
        setCurrentSource(currentSource)
        setNewSource(currentSource)
    }, [source])

    /**
     * when the source changes, make sure its valid JSON and update the local source
     * @param source
     */
    const handleSourceChange = source => {
        setValidJson(true)

        if (!source || typeof source !== 'string') {
            return
        }

        // need to make sure JSON is valid
        if (!isValidJSON(source)) {
            setValidJson(false)
            return
        }

        setNewSource(JSON.parse(source))
    }

    /**
     * on blur, trigger the onchange event
     */
    const handleBlur = () => {
        onChange(typeof newSource === 'string' ? JSON.parse(newSource) : newSource)
    }

    return (
        <Card className={styles.card}>
            <Card.Body>
                <div className={styles.note}>
                    <p>
                        <b>Note:</b> To undo an action press Ctrl+Z (or Cmd+Z on Mac)
                    </p>
                </div>

                {currentSource && (
                    <>
                        <CodeEditor
                            text={
                                currentSource
                                    ? JSON.stringify(currentSource, null, 2)
                                    : ''
                            }
                            style={{
                                width: '100%',
                                height: '400px',
                                display: 'block',
                            }}
                            onTextChange={handleSourceChange}
                            onBlur={handleBlur}
                            theme="tomorrow"
                        />

                        {!validJson && (
                            <Alert variant="danger">
                                Invalid JSON, please review and fix any JSON errors.
                            </Alert>
                        )}

                        <div>
                            <a
                                href={`data:text/json;charset=uft-8,${encodeURIComponent(
                                    JSON.stringify(currentSource, null, 2)
                                )}`}
                                download={`${title}.json`}
                            >
                                <Button className={styles.button} variant="secondary">
                                    {' '}
                                    Download{' '}
                                </Button>
                            </a>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    )
}

export default SourceDialog
