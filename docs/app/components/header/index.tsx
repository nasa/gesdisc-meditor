import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { MdFeedback, MdHelp, MdHome, MdPerson } from 'react-icons/md'
import { Link, LinksFunction } from 'remix'

type HeaderProps = {
    firstName?: string
    docsUrl: string
}

export const links: LinksFunction = () => {
    return [
        {
            rel: 'preload',
            href: '/meditor/docs/images/logo.png',
            as: 'image',
        },
    ]
}

export const Header = ({ firstName, docsUrl }: HeaderProps) => {
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
                            {firstName && (
                                <NavDropdown
                                    title={
                                        <>
                                            <MdPerson
                                                className="me-1"
                                                size={'1.3em'}
                                            />
                                            Hi, {firstName}
                                        </>
                                    }
                                >
                                    <NavDropdown.Item href="/meditor/api/logout">
                                        Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            )}
                            <Nav.Link href="/meditor">
                                <MdHome className="me-1" size={'1.3em'} />
                                Home
                            </Nav.Link>
                            <Nav.Link href="mailto:gsfc-uui-dev-disc@lists.nasa.gov">
                                <MdFeedback className="me-1" size={'1.3em'} />
                                Feedback
                            </Nav.Link>
                            <Link to={docsUrl} className="nav-link">
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
