import Image from 'next/image'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Navbar from 'react-bootstrap/Navbar'
import { MdFeedback, MdHelp, MdHome, MdPerson } from 'react-icons/md'
import styles from './header.module.css'

const Header = ({ user, isAuthenticated }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    return (
        <header className={styles.header}>
            <Navbar
                fixed="top"
                className={styles.navbar}
                style={{
                    justifyContent: 'space-between',
                    padding: '0 20px',
                }}
            >
                <Navbar.Brand href="/meditor">
                    <Image
                        alt="mEditor"
                        src="/meditor/logo.png"
                        width="156"
                        height="80"
                        className="d-inline-block align-top"
                    />
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
                                <Dropdown.Item
                                    href={
                                        process.env.NEXT_PUBLIC_API_BASE_PATH +
                                        '/logout'
                                    }
                                >
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    <Button
                        className="d-flex align-items-center"
                        variant="link"
                        style={{ color: 'grey', marginLeft: 10 }}
                        href="/meditor"
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
                        href={
                            process.env.HELP_DOCUMENT_LOCATION ||
                            '/meditor/docs/user-guide'
                        }
                        target="_blank"
                    >
                        <MdHelp style={{ fontSize: '1.6em' }} />
                        Help
                    </Button>
                </div>
            </Navbar>
        </header>
    )
}

export default Header
