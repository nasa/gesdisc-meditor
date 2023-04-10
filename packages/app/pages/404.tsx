import { Breadcrumbs, Breadcrumb } from 'components/breadcrumbs'
import PageTitle from 'components/page-title'

export default function Custom404() {
    const pageTitle = '404 - Page Not Found'

    return (
        <>
            <PageTitle title={pageTitle} />

            <Breadcrumbs>
                <Breadcrumb title={pageTitle} />
            </Breadcrumbs>

            <div className="d-flex align-items-center justify-content-center vh-100">
                <div className="text-center">
                    <h1 className="display-1 fw-bold">404</h1>

                    <p className="fs-3">
                        <span className="text-danger">Sorry!</span> Page not found.
                    </p>

                    <p className="lead">
                        The page you&apos;re looking for doesn&apos;t exist.
                    </p>

                    <a href="/meditor" className="btn btn-primary">
                        Return to Homepage
                    </a>
                </div>
            </div>
        </>
    )
}
