import LoginDialog from '../components/login-dialog'
import { useEffect } from 'react'
import mEditorAPI from '../service/'
import { attachInterceptor } from '../service/'
import Router from 'next/router'

class User {
    roles: []

    constructor(props) {
        Object.assign(this, props)
    }

    rolesForModel(modelName) {
        return this.roles
            .filter((role: any) => role.model === modelName) // only get roles for the requested model name
            .map((role: any) => role.role) // retrieve the role name
            .filter((v, i, a) => a.indexOf(v) === i) // remove duplicates
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
                    .reduce((nodePrivileges, nodePrivilege) => nodePrivileges.concat(nodePrivilege.privilege), [])
            )
        })

        return privileges
    }
}

/**
 * handles app-wide user authentication, logging in the user and updating the state when the user
 * changes
 */
const UserAuthentication = ({ onUserUpdate = (_user: any) => {}, user, isAuthenticated }) => {
    async function fetchUser() {
        try {
            handleLoggedInUser(await mEditorAPI.getMe())
        } catch (err) {
            handleLoggedOutUser()
        }
    }

    async function handleLoggedInUser(user) {
        onUserUpdate(new User(user))
    }

    async function handleLoggedOutUser() {
        onUserUpdate(null)

        // unauthenticated users can only view the dashboard, send them there
        if (Router.pathname != '/') {
            localStorage.setItem(
                'redirectUrl',
                JSON.stringify({
                    href: Router.pathname.indexOf('/meditor') >= 0 ? Router.pathname : `/meditor${Router.pathname}`,
                    as: Router.asPath,
                })
            )

            Router.push('/meditor')
        }
    }

    useEffect(() => {
        attachInterceptor({
            response: function(response) {
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
            <LoginDialog show={typeof user !== 'undefined' && isAuthenticated === false} />
        </>
    )
}

export default UserAuthentication
