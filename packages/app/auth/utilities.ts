import { onlyUnique } from 'utils/array'
import { User } from 'declarations'
import { WorkflowNode } from 'workflows/types'

export function rolesForModel(
    user: User | undefined,
    modelName: string
): Array<string> {
    return (user?.roles ?? [])
        .filter(role => role.model === modelName) // only get roles for the requested model name
        .map(role => role.role) // retrieve the role name
        .filter(onlyUnique)
}

export function privilegesForModelAndWorkflowNode(
    user: User | undefined,
    modelName: string,
    node: WorkflowNode
) {
    if (!user || !node?.privileges) {
        return []
    }

    let privileges = []
    let roles = rolesForModel(user, modelName)

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
