import { useRouter } from 'next/router'
import { withApollo } from '../../../lib/apollo'

const EditDocumentPage = () => {
    const router = useRouter()
    const { modelName, documentTitle } = router.query

    return (
        <div>
            edit document: {modelName} -- {documentTitle}
        </div>
    )
}

export default withApollo({ ssr: true })(EditDocumentPage)

