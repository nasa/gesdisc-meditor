import { JSX as LocalJSX } from '@gesdisc/meditor-components/loader'
import type { CKEditor } from 'ckeditor4-react'
import { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { HttpException } from './utils/errors'

declare global {
    export namespace JSX {
        interface IntrinsicElements extends StencilToReact {}
    }

    var CKEDITOR: CKEditor
}

export type APIError = {
    status: number
    error: string
}

export type ErrorData<T> = [Error | APIError | HttpException | null, T | null]

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
