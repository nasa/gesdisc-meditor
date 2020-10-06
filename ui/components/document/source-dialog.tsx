import Card from 'react-bootstrap/Card'
import React from 'react'
import styles from './source-dialog.module.css'
import Button from 'react-bootstrap/Button'
import { useState} from 'react'

const SourceDialog = ({ source, title, onSave}) => {
    const [newSource, setNewSource] = useState(() => {
        if(!source){
            return {}
        }
        let newSource = source
        delete newSource['x-meditor']
        delete newSource._id
        return newSource
    })
    
    /*
    useEffect(() => {
        setNewSource(source.text)
    },[source])*/

    const handleClick = (event) => {
        event.preventDefault()
        onSave(newSource)
        console.log(newSource);
    }

    return (
        <div>
            <Card className={styles.card}>
                <Card.Body>
                    <code-editor
                        text={JSON.stringify(source, null, 2)}
                        style={{ width: '350px', height: '400px', display: 'block' }}
                        onTextChange={(source) => setNewSource(source)}
                        //onChange={(e) => setNewSource(e.target.value)}
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
