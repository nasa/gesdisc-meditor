import { DetailedHTMLProps, HTMLAttributes } from 'react'
import { HttpError } from 'http-errors'
import { JSX as LocalJSX } from '@gesdisc/meditor-components/loader'
import 'next-auth'
import type { CKEditor } from 'ckeditor4-react'
import type { Stan } from 'node-nats-streaming'
import type { User as NextAuthUser } from 'next-auth'

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module 'next-auth' {
    interface Session {
        user: NextAuthUser & {
            uid?: string
        }
    }
}

declare global {
    export namespace JSX {
        interface IntrinsicElements extends StencilToReact {}
    }

    var CKEDITOR: CKEditor

    var natsClient: Stan
}

export type APIError = {
    status: number
    error: string
}

export type ErrorData<T> = [Error | HttpError | null, T | null]

type gReactProps<T> = {
    [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>
}

type StencilProps<T> = {
    [P in keyof T]?: Omit<T[P], 'ref'>
}

type StencilToReact<
    T = LocalJSX.IntrinsicElements,
    U = HTMLElementTagNameMap
> = StencilProps<T> & ReactProps<U>
