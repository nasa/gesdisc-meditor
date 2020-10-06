import Card from 'react-bootstrap/Card'
import React from 'react'
import styles from './source-dialog.module.css'
import Button from 'react-bootstrap/Button'
import { useState, useEffect } from 'react'

const SourceDialog = ({ source, title}) => {
    //const [newSource, setNewSource] = useState('')
    
    /*
    useEffect(() => {
        setNewSource(source.text)
    },[source])*/

    const handleClick = (event) => {
        event.preventDefault()
        console.log("Updated Source");
    }

    return (
        <div>
            <Card className={styles.card}>
                <Card.Body>
                    <code-editor
                        text={JSON.stringify(source, null, 2)}
                        style={{ width: '350px', height: '400px', display: 'block' }}
                        //onTextChange={(source) => console.log("source",source)}
                    />
                    <div>
                    <Button className={styles.button} variant="secondary" onClick={handleClick}>Save</Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    )
}

export default SourceDialog
