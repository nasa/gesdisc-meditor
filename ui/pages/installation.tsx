import type { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'
import { useEffect, useState } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import { FaDatabase } from 'react-icons/fa'
import { MdDelete, MdNavigateNext } from 'react-icons/md'
import IconButton from '../components/jsonschemaform/components/IconButton'
import Loading from '../components/loading'
import PageTitle from '../components/page-title'
import { refreshDataInPlace } from '../lib/next'
import { getModels } from '../models/model'
import { fetchSeedDb } from '../setup/http'
import type { UserDuringSetup } from '../setup/types'
import styles from './installation.module.css'

// import mEditorApi from '../service/'
/**
 * renders the install page ONLY if there aren't any models created yet (fresh install)
 */
const InstallationPage = () => {
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [maxSteps, setMaxSteps] = useState(1)
    const [users, setUsers] = useState<Array<UserDuringSetup>>([])
    const [validated, setValidated] = useState<boolean>(false)
    const [newUser, setNewUser] = useState<UserDuringSetup>(null)
    const [setupState, setSetupState] = useState<
        'not started' | 'in progress' | 'failed' | 'success'
    >('not started')

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

        const [error] = await fetchSeedDb(users)

        if (!!error) {
            return setTimeout(() => {
                setSetupState('failed')
            }, 1000)
        }

        setTimeout(() => {
            setSetupState('success')
            goToStep(4)
        }, 1000)
    }

    return (
        <div className={styles.container}>
            <PageTitle title="Installation" />

            <Accordion className={styles.accordion} activeKey={step.toString()}>
                <Card className="shadow-sm mb-3">
                    <Card.Header
                        className={`${styles.cardHeader} ${
                            step == 1 ? 'text-primary' : ''
                        }`}
                        onClick={() => goToStep(1)}
                    >
                        Welcome
                    </Card.Header>

                    <Accordion.Collapse eventKey={'1'}>
                        <Card.Body>
                            <p>
                                You are almost ready to start using mEditor! Before
                                you login, we'll guide you through setting up mEditor
                                for the first time.
                            </p>
                            <p>
                                This should only take a few minutes, and then you'll
                                be on your way!
                            </p>
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
                        className={`${styles.cardHeader} ${
                            step == 2 ? 'text-primary' : ''
                        }`}
                        onClick={() => goToStep(2)}
                    >
                        Add User(s)
                    </Card.Header>

                    <Accordion.Collapse eventKey={'2'}>
                        <Card.Body>
                            <p>
                                You'll need to add at least one user who has access to
                                modifying users and models.
                            </p>
                            <p>Don't worry, you can always change this later.</p>

                            <h5 className="mt-4">Users</h5>

                            <ListGroup>
                                {users.length == 0 && (
                                    <ListGroup.Item>
                                        <em>No users added yet.</em>
                                    </ListGroup.Item>
                                )}

                                {users.map((user: UserDuringSetup, index: number) => (
                                    <ListGroup.Item
                                        key={user.uid}
                                        className="d-flex align-items-center justify-content-between"
                                    >
                                        <span>
                                            {user.name} ({user.uid})
                                        </span>

                                        <IconButton
                                            alt="Remove User"
                                            onClick={() => removeUser(index)}
                                        >
                                            <MdDelete />
                                        </IconButton>
                                    </ListGroup.Item>
                                ))}

                                {!newUser && (
                                    <ListGroup.Item>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => resetAddUserForm()}
                                        >
                                            Add another user
                                        </Button>
                                    </ListGroup.Item>
                                )}

                                {newUser && (
                                    <ListGroup.Item>
                                        <Form
                                            noValidate
                                            validated={validated}
                                            onSubmit={handleAddNewUser}
                                        >
                                            <Form.Row>
                                                <Form.Group
                                                    as={Col}
                                                    md="4"
                                                    controlId="validationCustom01"
                                                >
                                                    <Form.Label>Username</Form.Label>
                                                    <Form.Control
                                                        required
                                                        name="uid"
                                                        type="text"
                                                        value={newUser.uid}
                                                        onChange={handleNewUserChange}
                                                    />
                                                    <Form.Text className="text-muted">
                                                        Should match the username in
                                                        your chosen auth provider (ex.
                                                        Earthdata login UID)
                                                    </Form.Text>
                                                </Form.Group>

                                                <Form.Group
                                                    as={Col}
                                                    md="4"
                                                    controlId="validationCustom01"
                                                >
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
                                                    <Form.Label className="d-block">
                                                        &nbsp;
                                                    </Form.Label>
                                                    <Button
                                                        variant="secondary"
                                                        type="submit"
                                                    >
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
                        className={`${styles.cardHeader} ${
                            step == 3 ? 'text-primary' : ''
                        }`}
                        onClick={() => goToStep(3)}
                    >
                        Populate Database
                    </Card.Header>

                    <Accordion.Collapse eventKey={'3'}>
                        <Card.Body>
                            {(setupState == 'in progress' ||
                                setupState == 'success') && (
                                <Loading text="Populating database...please wait" />
                            )}

                            {setupState == 'failed' && (
                                <Alert variant="danger">
                                    <p>
                                        Sorry, but something went wrong while we were
                                        trying to populate the database.
                                    </p>
                                    <p>
                                        Please review the server logs to resolve the
                                        issue, then try to run again.
                                    </p>
                                </Alert>
                            )}

                            {setupState == 'not started' && (
                                <>
                                    <p>
                                        We have everything we need to populate the
                                        database for the first time. We'll be adding
                                        the following to the database:
                                    </p>

                                    <ul>
                                        <li>
                                            Base mEditor models: "Models",
                                            "Workflows", and "Users"
                                        </li>
                                        <li>
                                            Two workflows to start with:
                                            "Edit-Review-Publish" and "Edit"
                                        </li>
                                        <li>
                                            The {users.length}{' '}
                                            {pluralize('user', users.length)} that you
                                            requested
                                        </li>
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
                    <Card.Header
                        className={`${styles.cardHeader} ${
                            step == 4 ? 'text-primary' : ''
                        }`}
                    >
                        Setup Complete!
                    </Card.Header>

                    <Accordion.Collapse eventKey={'4'}>
                        <Card.Body>
                            <p>mEditor was successfully setup!</p>
                            <p>You can login now and start using mEditor</p>

                            <Button
                                variant="primary"
                                onClick={() => refreshDataInPlace(router)}
                            >
                                Login to mEditor
                            </Button>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    )
}

export async function getServerSideProps(context: NextPageContext) {
    const models = await getModels()

    if (models?.length) {
        // there are already models! redirect back to the dashboard
        return {
            redirect: {
                // Don't use the base path (see nex.config.js) here: if used, '/' redirects to '/meditor/' which redirects to '/meditor'.
                basePath: false,
                destination: '/meditor',
                permanent: true,
            },
        }
    }

    return {
        props: {},
    }
}

export default InstallationPage
