import { JSX as LocalJSX } from '@gesdisc/meditor-components/loader'
import type { CKEditor } from 'ckeditor4-react'
import { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { HttpException } from './utils/errors'
import type { Stan } from 'node-nats-streaming'
import 'next-auth'
import type { User } from './auth/types'
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

export type ErrorData<T> = [Error | HttpException | null, T | null]

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
