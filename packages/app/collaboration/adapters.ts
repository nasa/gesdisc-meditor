import type { User } from 'auth/types'
import type { Collaborator } from './types'

export function adaptUserToCollaborator(
    user: User,
    privileges: Collaborator['privileges'],
    hasBeenActive: Collaborator['hasBeenActive'],
    isActive: Collaborator['isActive']
): Collaborator {
    const { firstName, lastName, uid } = user
    const [firstNameInitial] = firstName.split('')
    const [lastNameInitial] = lastName.split('')

    return {
        firstName,
        hasBeenActive,
        initials: `${firstNameInitial}${lastNameInitial}`,
        isActive,
        lastName,
        privileges,
        uid,
    }
}
