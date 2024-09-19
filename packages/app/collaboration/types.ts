import type { User } from 'auth/types'
import type { ObjectId } from 'mongodb'

export type Collaborator = {
    firstName: User['firstName']
    hasBeenActive: boolean
    initials: string
    isActive: boolean
    lastName: User['lastName']
    privileges: string[]
    uid: User['uid']
}
