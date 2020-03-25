import { withApollo } from '../../lib/apollo'
import ModelsList from '../../components/models-list'

const DashboardPage = () => {
    return (
        <div>
            <ModelsList />
        </div>
    )
}

export default withApollo({ ssr: true })(DashboardPage)

