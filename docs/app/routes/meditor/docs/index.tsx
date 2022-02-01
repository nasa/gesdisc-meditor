import { LoaderFunction, redirect } from 'remix'

export const loader = (): LoaderFunction => {
    throw redirect('/meditor/docs/user-guide')
}

export default function DocsIndex() {
    return null
}
