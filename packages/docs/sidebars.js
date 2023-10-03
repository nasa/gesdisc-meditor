// @ts-check
// https://docusaurus.io/docs/sidebar

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    // By default, Docusaurus generates a sidebar from the docs folder structure
    userGuideSidebar: [
        'introduction',
        {
            type: 'category',
            label: 'User Guide',
            collapsed: false,
            link: {
                type: 'generated-index',
                title: 'mEditor User Guide',
                description: 'Learn how to use mEditor.',
                slug: '/user-guide',
            },
            items: [
                'user-guide/quick-start',
                'user-guide/working-with-documents',
                'user-guide/workflows-and-roles',
                'user-guide/using-comments',
                'user-guide/versions-and-history',
                'user-guide/search-syntax',
            ],
        },
    ],
    openApiSidebar: [
        {
            type: 'category',
            label: 'mEditor',
            link: {
                type: 'generated-index',
                title: 'mEditor API',
                description: "This is the documentation for mEditor's API.",
                slug: '/api',
            },
            // @ts-ignore
            items: require('./docs/meditor-api/sidebar.js'),
        },
    ],
}

module.exports = sidebars
