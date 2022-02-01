import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { MdFeedback, MdHelp, MdHome, MdPerson } from 'react-icons/md'
import { Link, LinksFunction } from 'remix'

type HeaderProps = {
    user?: { firstName: string }
}

// todo: loader to check /me api to see what comes back for header

// todo: Even though this component might eventually be used outside of /meditor/docs, right now the nginx proxy directs traffic from /meditor/docs to this app so these URLs need to mirror that base path (or another solution needs to be created).
export const links: LinksFunction = () => {
    return [
        {
            rel: 'preload',
            href: '/meditor/docs/images/logo.png',
            as: 'image',
        },
    ]
}

export const Header = ({ user }: HeaderProps) => {
    return (
        <header>
            <Navbar
                bg="white"
                className="shadow py-0"
                collapseOnSelect
                expand="md"
                fixed="top"
                variant="light"
            >
                <Container>
                    <Navbar.Brand className="py-0" href="/meditor">
                        <img
                            alt="mEditor"
                            height="80"
                            src="/meditor/docs/images/logo.png"
                            width="156"
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="ms-auto">
                            {user && (
                                <NavDropdown
                                    title={
                                        <>
                                            <MdPerson
                                                className="me-1"
                                                size={'1.3em'}
                                            />
                                            Hi, {user?.firstName}
                                        </>
                                    }
                                >
                                    <NavDropdown.Item href="/meditor/api/logout">
                                        Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            )}
                            <Link to="/meditor" className="nav-link">
                                <MdHome className="me-1" size={'1.3em'} />
                                Home
                            </Link>
                            <Nav.Link href="mailto:gsfc-uui-dev-disc@lists.nasa.gov">
                                <MdFeedback className="me-1" size={'1.3em'} />
                                Feedback
                            </Nav.Link>
                            <Link to="/docs/user-guide" className="nav-link">
                                <MdHelp className="me-1" size={'1.3em'} />
                                Help
                            </Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}
