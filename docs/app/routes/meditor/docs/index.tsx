import type { LoaderFunction, MetaFunction } from 'remix'
import { redirect } from 'remix'

export const meta: MetaFunction = () => {
    return { title: 'Documentation | mEditor' }
}

export const loader: LoaderFunction = async () => {
    throw redirect('/meditor/docs/user-guide/')
}
