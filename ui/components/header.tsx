import Router from 'next/router'
import Button from 'react-bootstrap/Button'
import Navbar from 'react-bootstrap/Navbar'
import { MdPerson, MdHome, MdFeedback, MdHelp } from 'react-icons/md'
import styles from './header.module.css'

function goToHomepage() {
    Router.push('/')
}

const Header = () => {
    return (
        <>
            <Navbar fixed="top" className={styles.navbar} style={{
                justifyContent: "space-between",
                padding: "0 20px",
            }}>
                <Navbar.Brand href="#home" onClick={goToHomepage}>
                    <img
                        alt="mEditor"
                        src="/logo.png"
                        width="156"
                        className="d-inline-block align-top"
                    />
                </Navbar.Brand>

                <div>
                    <Button variant="link">
                        <MdPerson />
                        Hi, Jon
                    </Button>

                    <Button variant="link" onClick={goToHomepage}>
                        <MdHome />
                        Home
                    </Button>

                    <Button variant="link">
                        <MdFeedback />
                        Feedback
                    </Button>

                    <Button variant="link">
                        <MdHelp />
                        Help
                    </Button>
                </div>
            </Navbar>
        </>
    )
}

export default Header
