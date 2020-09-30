import Card from 'react-bootstrap/Card'
import React from 'react'
import styles from './source-dialog.module.css'
import Button from 'react-bootstrap/Button'

const SourceDialog = ({ source, title }) => {
    return (
        <div>
            <Card className={styles.card}>
                <Card.Body>
                    <code-editor
                        text={JSON.stringify(source, null, 2)}
                        style={{ width: '780px', height: '500px', display: 'block' }}
                    />
                    <div>
                        <Button>Save</Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    )
}

export default SourceDialog
