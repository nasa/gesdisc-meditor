import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useState, useEffect, useContext } from 'react'
import { AppContext } from '../app-store'
import { cloneDocument } from '../../documents/http'

const CloneDocumentModal = ({
    modelName,
    documentTitle,
    onCancel,
    onSuccess,
    show = false,
    modalTitle = 'Clone Document',
}) => {
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)
    const [busy, setBusy] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const isInvalid = isDirty && (!newTitle || newTitle == documentTitle)

    // create temporary title that the user has to change
    useEffect(() => {
        setNewTitle('Copy of ' + documentTitle)
    }, [documentTitle])

    async function clone() {
        setIsDirty(true)

        if (!newTitle || newTitle == documentTitle) return

        setBusy(true)

        const [error] = await cloneDocument(modelName, documentTitle, newTitle)

        setBusy(false)

        if (error) {
            setErrorNotification(error.message || 'Failed to clone document')
        } else {
            onSuccess()
        }
    }

    return (
        <Modal
            show={show}
            onHide={onCancel}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>New Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            isInvalid={isInvalid}
                            onBlur={() => setIsDirty(true)}
                        />

                        <Form.Text
                            className={isInvalid ? 'text-danger' : 'text-muted'}
                        >
                            Please enter a unique title for this cloned document.
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={busy}>
                    Cancel
                </Button>

                <Button
                    variant="primary"
                    onClick={clone}
                    disabled={isInvalid || busy}
                >
                    Clone
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default CloneDocumentModal
