import { useRouter } from 'next/router'
import { withApollo } from '../../lib/apollo'

const ModelPage = (props) => {
    const router = useRouter()
    const { modelName } = router.query

    return (
        <div>
            {modelName}
        </div>
    )
}

export default withApollo({ ssr: true })(ModelPage)

