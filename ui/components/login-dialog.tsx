import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { MdPerson } from 'react-icons/md'
import styles from './login-dialog.module.css'

const LoginDialog = ({
    show = false,
    onHide = () => {},
}) => {
    function login() {
        window.location.href = process.env.NEXT_PUBLIC_API_BASE_PATH + '/login'
    }

    return (
        <Modal show={show} centered onHide={onHide} animation={false} dialogClassName="modal-sm">
            <Modal.Body className={styles.body}>
                <h3>Welcome!</h3>

                <p>mEditor requires that you be an authorized user to add models or edit documents, so please...</p>

                <Button onClick={login} variant="link">
                    <MdPerson size={20} />
                    Login
                </Button>

                <small>No account? Please <a href="https://urs.earthdata.nasa.gov">register</a>.<br />Not sure how to register? View the <a href={process.env.HELP_DOCUMENT_LOCATION || "/meditor/docs/user-guide"}>User Guide</a>.</small>
            </Modal.Body>
        </Modal>
    )
}

export default LoginDialog
