import Button from 'react-bootstrap/Button'
import Dashboard, { sortModelsIntoCategories } from './index'
import styles from './signin.module.css'
import { getModelsWithDocumentCount } from '../models/service'
import { getProviders, signIn } from 'next-auth/react'
import { getServerSession } from '../auth/user'
import { MdPerson } from 'react-icons/md'
import { sortModels } from '../utils/sort'
import type { DashboardPageProps } from './index'
import type { GetServerSidePropsContext } from 'next'
import type { Provider } from 'next-auth/providers'

export interface SignInPageProps extends DashboardPageProps {
    providers: Provider[]
}

const SignInPage = ({ modelCategories, providers }: SignInPageProps) => {
    return (
        <div>
            <Dashboard modelCategories={modelCategories} />
            <LoginDialog providers={providers} />
            <div className="modal-backdrop show" />
        </div>
    )
}

const LoginDialog = ({ providers }: { providers: Provider[] }) => {
    //? the design makes the login button appear in a modal dialog however if we use a React-Bootstrap modal, the modal will not hydrate correctly and will generate an error as
    //? the modal is not present on the server side. Instead we'll use the HTML directly
    return (
        <div
            role="dialog"
            aria-modal="true"
            className={`modal ${styles.modal}`}
            tabIndex={-1}
        >
            <div className="modal-dialog modal-sm modal-dialog-centered">
                <div className="modal-content">
                    <div className={`modal-body ${styles.modalBody}`}>
                        <h3>Welcome!</h3>

                        <p>
                            mEditor requires that you be an authorized user to add
                            models or edit documents, so please...
                        </p>

                        {providers &&
                            Object.values(providers).map(provider => (
                                <div key={provider.name} className="mb-2">
                                    <Button onClick={() => signIn(provider.id)}>
                                        <MdPerson size={20} className="mr-2" />
                                        Login with {provider.name}
                                    </Button>
                                </div>
                            ))}

                        <small>
                            Not sure how to login or need to register an account?
                            <br /> View the{' '}
                            <a
                                href={
                                    process.env.HELP_DOCUMENT_LOCATION ||
                                    '/meditor/docs/user-guide'
                                }
                            >
                                User Guide
                            </a>{' '}
                            for help.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getServerSession(ctx.req, ctx.res)

    if (session) {
        // already have a session, redirect to the dashboard
        return {
            redirect: {
                destination: '/',
                statusCode: 302,
            },
        }
    }

    const [_error, modelsWithDocumentCount] = await getModelsWithDocumentCount()
    const models = (modelsWithDocumentCount || []).sort(sortModels)

    if (!models.length) {
        // no models, database hasn't been setup yet, redirect to installation page!
        return {
            redirect: {
                destination: '/installation',
                statusCode: 301,
            },
        }
    }

    const providers = await getProviders()

    if (!Object.keys(providers).length) {
        //! Fatal error that only occurs if mEditor is misconfigured (no provider ENV variables setup)
        throw new Error('Failed to retrieve authentication providers')
    }

    const modelCategories = sortModelsIntoCategories(models)

    return {
        props: {
            modelCategories: JSON.parse(JSON.stringify(modelCategories)),
            providers,
        },
    }
}

export default SignInPage
