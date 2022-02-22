import { withApollo } from '../lib/apollo'
import PageTitle from '../components/page-title'
import gql from 'graphql-tag'
import styles from './installation.module.css'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { MdNavigateNext, MdDelete } from 'react-icons/md'
import { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup'
import IconButton from '../components/jsonschemaform/components/IconButton'
import { FaDatabase } from 'react-icons/fa'
import mEditorApi from '../service/'
import Loading from '../components/loading'
import Alert from 'react-bootstrap/Alert'

interface User {
    name: string
    uid: string
}

// basic query to test if the database is already setup
// if so, the page will be auto redirected back to the homepage
const QUERY = gql`
    {
        models {
            name
        }
    }
`

/**
 * renders the install page ONLY if there aren't any models created yet (fresh install)
 */
const InstallationPage = () => {
    const [step, setStep] = useState(1)
    const [maxSteps, setMaxSteps] = useState(1)
    const [users, setUsers] = useState<Array<User>>([])
    const [validated, setValidated] = useState<boolean>(false)
    const [newUser, setNewUser] = useState<User>(null)
    const [setupState, setSetupState] = useState<'not started' | 'in progress' | 'failed' | 'success'>('not started')

    useEffect(() => {
        // show add user form by default
        resetAddUserForm()
    }, [])

    function goToStep(newStep) {
        if (newStep < step) {
            return
        }

        if (newStep > maxSteps) {
            setMaxSteps(newStep)
        }

        setTimeout(() => setStep(newStep.toString()), 150)
    }

    function handleAddNewUser(event) {
        const form = event.currentTarget

        event.preventDefault()
        event.stopPropagation()

        if (form.checkValidity() !== false) {
            setUsers([].concat(users, newUser))
            setNewUser(null)
        }

        setValidated(true)
    }

    function handleNewUserChange(event) {
        setNewUser({ ...newUser, [event.target.name]: event.target.value })
    }

    function resetAddUserForm() {
        setNewUser({ name: '', uid: '' })
    }

    function removeUser(index) {
        setUsers([...users.slice(0, index), ...users.slice(index + 1)])
    }

    async function runSetup() {
        setSetupState('in progress')

        try {
            await mEditorApi.setup(users)
            setTimeout(() => {
                setSetupState('success')
                goToStep(4)
            }, 1000)
        } catch (err) {
            console.error('Failed to setup ', err)
            setTimeout(() => setSetupState('failed'), 1000)
        }
    }

    return (
        <div className={styles.container}>
            <PageTitle title="Installation" />

            <Accordion className={styles.accordion} activeKey={step.toString()}>
                <Card className="shadow-sm mb-3">
                    <Card.Header
                        className={`${styles.cardHeader} ${step == 1 ? 'text-primary' : ''}`}
                        onClick={() => goToStep(1)}
                    >
                        Welcome
                    </Card.Header>

                    <Accordion.Collapse eventKey={'1'}>
                        <Card.Body>
                            <p>
                                You are almost ready to start using mEditor! Before you login, we'll guide you through
                                setting up mEditor for the first time.
                            </p>
                            <p>This should only take a few minutes, and then you'll be on your way!</p>
                            <p>
                                <Button variant="primary" onClick={() => goToStep(2)}>
                                    Proceed
                                    <MdNavigateNext />
                                </Button>
                            </p>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>

                <Card className={`shadow-sm mb-3 ${maxSteps < 2 ? 'd-none' : ''}`}>
                    <Card.Header
                        className={`${styles.cardHeader} ${step == 2 ? 'text-primary' : ''}`}
                        onClick={() => goToStep(2)}
                    >
                        Add User(s)
                    </Card.Header>

                    <Accordion.Collapse eventKey={'2'}>
                        <Card.Body>
                            <p>You'll need to add at least one user who has access to modifying users and models.</p>
                            <p>Don't worry, you can always change this later.</p>

                            <h5 className="mt-4">Users</h5>

                            <ListGroup>
                                {users.length == 0 && (
                                    <ListGroup.Item>
                                        <em>No users added yet.</em>
                                    </ListGroup.Item>
                                )}

                                {users.map((user: User, index: number) => (
                                    <ListGroup.Item
                                        key={user.uid}
                                        className="d-flex align-items-center justify-content-between"
                                    >
                                        <span>
                                            {user.name} ({user.uid})
                                        </span>

                                        <IconButton alt="Remove User" onClick={() => removeUser(index)}>
                                            <MdDelete />
                                        </IconButton>
                                    </ListGroup.Item>
                                ))}

                                {!newUser && (
                                    <ListGroup.Item>
                                        <Button variant="outline-secondary" onClick={() => resetAddUserForm()}>
                                            Add another user
                                        </Button>
                                    </ListGroup.Item>
                                )}

                                {newUser && (
                                    <ListGroup.Item>
                                        <Form noValidate validated={validated} onSubmit={handleAddNewUser}>
                                            <Form.Row>
                                                <Form.Group as={Col} md="4" controlId="validationCustom01">
                                                    <Form.Label>Username</Form.Label>
                                                    <Form.Control
                                                        required
                                                        name="uid"
                                                        type="text"
                                                        value={newUser.uid}
                                                        onChange={handleNewUserChange}
                                                    />
                                                    <Form.Text className="text-muted">
                                                    Should match the username in your chosen auth provider (ex. Earthdata login UID)
                                                    </Form.Text>
                                                </Form.Group>

                                                <Form.Group as={Col} md="4" controlId="validationCustom01">
                                                    <Form.Label>Name</Form.Label>
                                                    <Form.Control
                                                        required
                                                        name="name"
                                                        type="text"
                                                        value={newUser.name}
                                                        onChange={handleNewUserChange}
                                                    />
                                                </Form.Group>

                                                <Form.Group as={Col} md="4">
                                                    <Form.Label className="d-block" ariaHidden={true}>&nbsp;</Form.Label>
                                                    <Button variant="secondary" type="submit">
                                                        Add User
                                                    </Button>
                                                </Form.Group>
                                            </Form.Row>
                                        </Form>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>

                            <Button
                                variant="primary"
                                className="mt-4"
                                onClick={() => goToStep(3)}
                                disabled={!users.length}
                            >
                                Next
                                <MdNavigateNext />
                            </Button>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>

                <Card className={`shadow-sm mb-3 ${maxSteps < 3 ? 'd-none' : ''}`}>
                    <Card.Header
                        className={`${styles.cardHeader} ${step == 3 ? 'text-primary' : ''}`}
                        onClick={() => goToStep(3)}
                    >
                        Populate Database
                    </Card.Header>

                    <Accordion.Collapse eventKey={'3'}>
                        <Card.Body>
                            {(setupState == 'in progress' || setupState == 'success') && (
                                <Loading text="Populating database...please wait" />
                            )}

                            {setupState == 'failed' && (
                                <Alert variant="danger">
                                    <p>
                                        Sorry, but something went wrong while we were trying to populate the database.
                                    </p>
                                    <p>Please review the server logs to resolve the issue, then try to run again.</p>
                                </Alert>
                            )}

                            {setupState == 'not started' && (
                                <>
                                    <p>
                                        We have everything we need to populate the database for the first time. We'll be
                                        adding the following to the database:
                                    </p>

                                    <ul>
                                        <li>Base mEditor models: "Models", "Workflows", and "Users"</li>
                                        <li>Two workflows to start with: "Edit-Review-Publish" and "Edit"</li>
                                        <li>The {users.length} user(s) that you requested</li>
                                        <li>An example model: "Example News"</li>
                                    </ul>

                                    <Button variant="primary" onClick={runSetup}>
                                        <FaDatabase className="mr-2" />
                                        Populate Database
                                    </Button>
                                </>
                            )}
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>

                <Card className={`shadow-sm mb-3 ${maxSteps < 4 ? 'd-none' : ''}`}>
                    <Card.Header className={`${styles.cardHeader} ${step == 4 ? 'text-primary' : ''}`}>
                        Setup Complete!
                    </Card.Header>

                    <Accordion.Collapse eventKey={'4'}>
                        <Card.Body>
                            <p>mEditor was successfully setup!</p>
                            <p>You can login now and start using mEditor</p>

                            <Button variant="primary" onClick={() => (window.location.href = '/meditor')}>
                                Login to mEditor
                            </Button>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    )
}

InstallationPage.getInitialProps = async (ctx) => {
    let models

    try {
        let response = await ctx.apolloClient.query(
            {
                query: QUERY,
            },
            {
                fetchPolicy: 'network-only',
            }
        )

        models = response.data.models
    } catch (err) {
        if (err?.graphQLErrors?.[0].extensions?.response?.status == 404) {
            // ignore this error, we're expecting a 404 on the installation page
        } else {
            // something else went wrong, log the error and stop rendering the page
            console.error(err)
            ctx.res.end()
        }
    }

    // there are already models! redirect back to the dashboard
    if (models && models.length > 0) {
        ctx.res.writeHead(301, {
            Location: '/meditor',
        })

        ctx.res.end()
    }

    return {}
}

export default withApollo({ ssr: true })(InstallationPage)
