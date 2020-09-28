import Card from 'react-bootstrap/Card'
import React from 'react'
import styles from './source-dialog.module.css'
import Button from 'react-bootstrap/Button'
//import { CodeEditor } from '../../../components/codeeditor-react/src/components'
//import { CodeEditor } from 'codeeditor-react'

const SourceDialog = ({ source }) => {
    
    return (
        <div>
                <Card  className={styles.card} >
                    <Card.Body>
                       <div>
                           {JSON.stringify(source)}
                       </div>
                       <div>
                           <Button className={styles.button} variant="secondary">Save</Button>
                       </div>
                    </Card.Body>
                </Card>
        </div>
    )
}

export default SourceDialog


