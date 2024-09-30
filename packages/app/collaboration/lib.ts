import type { User } from 'auth/types'
import type { Collaborator } from './types'

export function filterActiveUser(collaborators: Collaborator[], activeUser: User) {
    return (
        collaborators?.filter(collaborator => collaborator.uid !== activeUser.uid) ??
        []
    )
}
