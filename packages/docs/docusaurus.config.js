// @ts-check
// https://github.com/PaloAltoNetworks/docusaurus-openapi-docs

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'mEditor Documentation',
    tagline: 'How to use the GES DISC Model Editor application and API',
    url: process.env.MEDITOR_ORIGIN || 'http://localhost',
    baseUrl: '/meditor/docs/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'images/favicon.ico',

    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    routeBasePath: '/',
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl:
                        'https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/browse/docs',
                    docLayoutComponent: '@theme/DocPage',
                    docItemComponent: '@theme/ApiItem',
                },
                blog: false,
                // blog: {
                //     blogTitle: 'Making mEditor',
                //     routeBasePath: '/blog',
                // },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            docs: {
                sidebar: {
                    hideable: true,
                },
            },
            navbar: {
                title: 'mEditor Docs',
                logo: {
                    alt: 'mEditor',
                    src: 'images/mEditor-icon.svg',
                },
                items: [
                    {
                        label: 'API',
                        position: 'left',
                        to: '/api',
                    },
                    {
                        label: 'Read Me',
                        position: 'left',
                        to: '/readme',
                    },
                    {
                        label: 'User Guide',
                        position: 'left',
                        to: '/user-guide',
                    },
                    {
                        label: 'Changelog',
                        position: 'right',
                        to: '/changelog',
                    },
                    {
                        label: 'Contributing',
                        position: 'right',
                        to: '/contributing',
                    },
                    {
                        label: 'Code of Conduct',
                        position: 'right',
                        to: '/code-of-conduct',
                    },
                    {
                        href: 'https://github.com/nasa/gesdisc-meditor',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            languageTabs: [
                {
                    highlight: 'bash',
                    language: 'curl',
                    logoClass: 'bash',
                },
                {
                    highlight: 'python',
                    language: 'python',
                    logoClass: 'python',
                },
                {
                    highlight: 'javascript',
                    language: 'nodejs',
                    logoClass: 'nodejs',
                },
            ],
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),

    plugins: [
        [
            'docusaurus-plugin-openapi-docs',
            {
                id: 'openapi',
                docsPluginId: 'classic',
                config: {
                    meditor: {
                        //* to better understand what a completed spec does for the UI, use something like this:
                        specPath: 'api-spec/v1.yaml',
                        outputDir: 'docs/meditor-api',
                        downloadUrl:
                            'https://github.com/nasa/gesdisc-meditor/blob/main/packages/docs/api-spec/v1.yaml',
                        sidebarOptions: {
                            groupPathsBy: 'tag',
                            categoryLinkSource: 'tag',
                        },
                    },
                },
            },
        ],
    ],

    themes: ['docusaurus-theme-openapi-docs'],
}

module.exports = config
