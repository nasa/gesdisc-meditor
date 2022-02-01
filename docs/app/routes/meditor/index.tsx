import { LoaderFunction, redirect } from 'remix'

export const loader = (): LoaderFunction => {
    throw redirect('/meditor/docs')
}

export default function MeditorIndex() {
    return null
}
