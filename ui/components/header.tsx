import { useState } from 'react'
import Router from 'next/router'
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import Navbar from 'react-bootstrap/Navbar'
import { MdPerson, MdHome, MdFeedback, MdHelp } from 'react-icons/md'
import styles from './header.module.css'

function goToHomepage() {
    Router.push('/')
}

const Header = ({ user, isAuthenticated }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    return (
        <>
            <Navbar
                fixed="top"
                className={styles.navbar}
                style={{
                    justifyContent: 'space-between',
                    padding: '0 20px',
                }}
            >
                <Navbar.Brand href="#home" onClick={goToHomepage}>
                    <img alt="mEditor" src="/logo.png" width="156" className="d-inline-block align-top" />
                </Navbar.Brand>

                <div className="d-flex flex-row">
                    {isAuthenticated && (
                        <Dropdown
                            onMouseEnter={() => setUserMenuOpen(true)}
                            onMouseLeave={() => setUserMenuOpen(false)}
                            show={userMenuOpen}
                        >
                            <Dropdown.Toggle
                                className="d-flex align-items-center"
                                variant="link"
                                id="user-menu"
                                style={{ color: '#607d8b' }}
                            >
                                <MdPerson style={{ fontSize: '1.6em' }} />
                                Hi, {user?.firstName}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item href={process.env.NEXT_PUBLIC_API_BASE_PATH + '/logout'}>
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    <Button
                        className="d-flex align-items-center"
                        variant="link"
                        style={{ color: 'grey', marginLeft: 10 }}
                        onClick={goToHomepage}
                    >
                        <MdHome style={{ fontSize: '1.6em' }} />
                        Home
                    </Button>

                    <Button
                        className="d-flex align-items-center"
                        variant="link"
                        style={{ color: 'grey', marginLeft: 10 }}
                        href="mailto:gsfc-uui-dev-disc@lists.nasa.gov"
                    >
                        <MdFeedback style={{ fontSize: '1.6em' }} />
                        Feedback
                    </Button>

                    <Button
                        className="d-flex align-items-center"
                        variant="link"
                        style={{ color: 'grey', marginLeft: 10 }}
                        as="a"
                        href="https://docs.google.com/document/d/e/2PACX-1vSNC0fvXJ6rbOuuOcAGarA1s4ys3l0mKZ608RgPPlHVvBAYAktxoUWUIsVZqY_QQYN4OvPR6xppz7mI/pub"
                        target="_blank"
                    >
                        <MdHelp style={{ fontSize: '1.6em' }} />
                        Help
                    </Button>
                </div>
            </Navbar>
        </>
    )
}

export default Header
