import { User } from 'next-auth'

export type UserWithRoles = User & {
    firstName?: string
    lastName?: string
    uid?: string
    roles: UserRole[]
}

export type UserContactInformation = {
    uid: string // authentication provider's id (URS uid, Cognito id, etc.)
    emailAddress: string
    name: string
    firstName: string
    lastName: string
}

export type UserRole = {
    model: string
    role: string
}
