import { Components, JSX as LocalJSX } from '@gesdisc/meditor-components/loader'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

type StencilProps<T> = {
    [P in keyof T]?: Omit<T[P], 'ref'>
}

type gReactProps<T> = {
    [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>
}

type StencilToReact<
    T = LocalJSX.IntrinsicElements,
    U = HTMLElementTagNameMap
> = StencilProps<T> & ReactProps<U>

declare global {
    export namespace JSX {
        interface IntrinsicElements extends StencilToReact {}
    }

    var CKEDITOR: any
}
