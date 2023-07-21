import Head from 'next/head'

const DEFAULT_PAGE_TITLE = 'mEditor'
const PAGE_TITLE_DELIMETER = ' | '

const PageTitle = ({ title }) => {
    let pageTitle = title
        ? [].concat(title, DEFAULT_PAGE_TITLE).join(PAGE_TITLE_DELIMETER)
        : DEFAULT_PAGE_TITLE

    return (
        <Head>
            <title key="title">{pageTitle}</title>
        </Head>
    )
}

export default PageTitle
