export interface EmailMessage {
    to: string[]
    cc: string[]
    subject: string
    body: string
    link: EmailMessageLink
    createdOn: string
}

export interface EmailMessageLink {
    label: string
    url: string
}
