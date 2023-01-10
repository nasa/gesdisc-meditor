export interface User {
    id: string // db id
    uid: string // authentication provider's id (URS uid, Cognito id, etc.)
    created: number
    emailAddress: string
    name: string
    firstName: string
    middleInitial?: string
    lastName: string
    studyArea?: string
    lastAccessed: number
    roles: UserRole[]
}

export interface UserRole {
    model: string
    role: string
}

export type UserContactInformation = Pick<
    User,
    'uid' | 'emailAddress' | 'firstName' | 'lastName'
>
