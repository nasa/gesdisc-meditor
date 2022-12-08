// @ts-check
// https://github.com/PaloAltoNetworks/docusaurus-openapi-docs

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'mEditor Documentation',
    tagline: 'How to use the GES DISC Model Editor application and API',
    url: 'https://your-docusaurus-test-site.com',
    baseUrl: '/meditor/docs',
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
                    src: 'images/logo.png',
                },
                items: [
                    {
                        type: 'doc',
                        docId: 'introduction',
                        position: 'left',
                        label: 'User Guide',
                    },
                    {
                        label: 'API',
                        position: 'left',
                        to: '/api',
                    },
                    {
                        href: 'https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/browse',
                        label: 'Code',
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
                        specPath: 'api-spec/meditor.yaml',
                        outputDir: 'docs/meditor-api',
                        downloadUrl:
                            'https://raw.githubusercontent.com/PaloAltoNetworks/docusaurus-template-openapi-docs/main/examples/petstore.yaml',
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
