import PageTitle from '../components/page-title'

/**
 * renders the maintenance page
 */
const MaintenancePage = () => {
    return (
        <div>
            <PageTitle title="Down for Maintenance" />

            <h2 className="mb-3">Down for Maintenance</h2>

            <p>mEditor is currently down for maintenance. Please check back in a few minutes.</p>
            <p>Thank you for your patience!</p>
        </div>
    )
}

export default MaintenancePage
