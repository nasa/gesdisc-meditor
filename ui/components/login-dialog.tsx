import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { MdPerson } from 'react-icons/md'
import styles from './login-dialog.module.css'

const LoginDialog = ({
    show = false,
    onHide = () => {},
}) => {
    function login() {
        window.location.href = '/meditor/api/login'
    }

    return (
        <Modal show={show} centered onHide={onHide} animation={false}>
            <Modal.Body className={styles.body}>
                <h3>Welcome!</h3>

                mEditor requires that you be an authorized user to add models or edit documents, so please...

                <Button onClick={login} variant="link">
                    <MdPerson />
                    Login
                </Button>

                <h5>No account? Please <a href="https://urs.earthdata.nasa.gov">register</a></h5>
            </Modal.Body>
        </Modal>
    )
}

export default LoginDialog
