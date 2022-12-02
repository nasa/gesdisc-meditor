import LoginDialog from '../components/login-dialog'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getMe } from '../auth/http'
import { attachInterceptor } from '../lib/fetch-interceptors'

export interface Role {
    model: string
    role: string
}

class User {
    roles: Array<Role>

    constructor(props) {
        Object.assign(this, props)

        if (!this.roles) {
            // ensure roles is an array
            this.roles = []
        }
    }

    rolesForModel(modelName: string): Array<string> {
        return this.roles
            .filter((role: Role) => role.model === modelName) // only get roles for the requested model name
            .map((role: Role) => role.role) // retrieve the role name
            .filter((v: string, i: number, a: Array<string>) => a.indexOf(v) === i) // remove duplicates
    }

    privilegesForModelAndWorkflowNode(modelName, node) {
        if (!node?.privileges) {
            return []
        }

        let privileges = []
        let roles = this.rolesForModel(modelName)

        roles.forEach(role => {
            privileges = privileges.concat(
                node.privileges
                    // only retrieve privilege matching the current role (ex. Author)
                    .filter(nodePrivilege => nodePrivilege.role == role)
                    // return a list of privileges for the current role (ex. ["edit", "comment"])
                    .reduce(
                        (nodePrivileges, nodePrivilege) =>
                            nodePrivileges.concat(nodePrivilege.privilege),
                        []
                    )
            )
        })

        return privileges
    }
}

/**
 * handles app-wide user authentication, logging in the user and updating the state when the user
 * changes
 */
const UserAuthentication = ({
    onUserUpdate = (_user: any) => {},
    user,
    isAuthenticated,
}) => {
    const router = useRouter()
    const automaticallySendUserToLoginProvider = new URLSearchParams(
        router.query as Record<string, string>
    ).has('autoLogin')
    const showLoginDialog =
        typeof user !== 'undefined' &&
        isAuthenticated === false &&
        !automaticallySendUserToLoginProvider

    async function fetchUser() {
        const [error, user] = await getMe()

        if (error) {
            handleLoggedOutUser()
        } else {
            handleLoggedInUser(user)
        }
    }

    async function handleLoggedInUser(user) {
        onUserUpdate(new User(user))
    }

    async function handleLoggedOutUser() {
        onUserUpdate(null)

        const loginUrl = automaticallySendUserToLoginProvider
            ? process.env.NEXT_PUBLIC_API_BASE_PATH + '/login'
            : '/meditor'

        if (router.pathname != '/') {
            // need to track the current URL before we redirect, so we can take the user back to the page they were trying to load
            localStorage.setItem(
                'redirectUrl',
                JSON.stringify({
                    href: router.pathname,
                    as: router.asPath,
                })
            )
        }

        if (router.pathname !== '/' || automaticallySendUserToLoginProvider) {
            // need to redirect the user to the login page (either the dashboard or the login provider - EDLogin/Cognito/etc.)
            window.location.href = loginUrl
        }
    }

    useEffect(() => {
        attachInterceptor({
            response: function (response) {
                if (response.status === 401) {
                    handleLoggedOutUser()
                }

                return response
            },
        })

        fetchUser()
    }, [])

    return (
        <>
            <LoginDialog show={showLoginDialog} />
        </>
    )
}

export default UserAuthentication
