import type { User } from 'auth/types'

export type Collaborator = {
    firstName: User['firstName']
    hasBeenActive: boolean
    initials: string
    isActive: boolean
    lastName: User['lastName']
    privileges: string[]
    uid: User['uid']
}

export type UserActivation = { hasBeenActive: boolean; isActive: boolean }
