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

                <div className="d-flex flex-row">
                    <Button className="d-flex align-items-center" variant="link" style={{ color: "#607d8b" }}>
                        <MdPerson style={{ fontSize: '1.6em' }} />
                        Hi, Jon
                    </Button>

                    <Button className="d-flex align-items-center" variant="link" style={{ color: "grey", marginLeft: 10 }} onClick={goToHomepage}>
                        <MdHome style={{ fontSize: '1.6em' }} />
                        Home
                    </Button>

                    <Button className="d-flex align-items-center" variant="link" style={{ color: "grey", marginLeft: 10 }}>
                        <MdFeedback style={{ fontSize: '1.6em' }} />
                        Feedback
                    </Button>

                    <Button className="d-flex align-items-center" variant="link" style={{ color: "grey", marginLeft: 10 }}>
                        <MdHelp style={{ fontSize: '1.6em' }} />
                        Help
                    </Button>
                </div>
            </Navbar>
        </>
    )
}

export default Header
