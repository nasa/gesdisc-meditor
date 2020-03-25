import { withApollo } from '../../../lib/apollo'

const NewDocumentPage = () => {
    return (
        <div>
            This is a new document
        </div>
    )
}

export default withApollo({ ssr: true })(NewDocumentPage)

