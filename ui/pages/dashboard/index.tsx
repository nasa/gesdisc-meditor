import { withApollo } from '../../lib/apollo'
import ModelsList from '../../components/models-list'

const Dashboard = () => {
    return (
        <div>
            <ModelsList />
        </div>
    )
}

export default withApollo({ ssr: true })(Dashboard)

