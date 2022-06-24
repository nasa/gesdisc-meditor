module.exports = {
    assetPrefix: '/meditor',
    basePath: '/meditor',
    webpackDevMiddleware: config => {
        config.watchOptions = {
            poll: 1000, // Check for changes every second
            aggregateTimeout: 300, // delay before rebuilding
        }
        return config
    },
    async redirects() {
        return [
            {
                source: '/api/listModels',
                permanent: true,
                destination: '/api/models',
            },
            {
                source: '/api/listDocuments',
                has: [
                    {
                        type: 'query',
                        key: 'model',
                    },
                ],
                permanent: true,
                destination: '/api/models/:model/documents',
            },
        ]
    },
}
