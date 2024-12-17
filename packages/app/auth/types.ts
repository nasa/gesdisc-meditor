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
