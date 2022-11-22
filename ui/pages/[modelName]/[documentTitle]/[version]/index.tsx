import { useRouter } from 'next/router'
import EditDocumentPage from '../index'
import withAuthentication from '../../../../components/with-authentication'

// TODO: move the document edit page content to a component, include that component in NewDocument, EditDocument, and EditDocumentByVersion
const EditDocumentByVersionPage = props => {
    const router = useRouter()
    const params = router.query
    const documentVersion = params.version as string

    return <EditDocumentPage {...props} version={documentVersion} />
}

export default withAuthentication()(EditDocumentByVersionPage)
