module.exports = {
    appDir: false,
    reactStrictMode: true,
    swcMinify: true,
    assetPrefix: '/meditor',
    basePath: '/meditor',
    webpack: config => {
        config.watchOptions = {
            poll: 1000, // Check for changes every second
            aggregateTimeout: 300, // delay before rebuilding
        }
        return config
    },
    async rewrites() {
        return [
            {
                source: '/api/changeDocumentState',
                destination: '/api/legacy-endpoints/changeDocumentState',
            },
            {
                source: '/api/cloneDocument',
                destination: '/api/legacy-endpoints/cloneDocument',
            },
            {
                source: '/api/getComments',
                destination: '/api/legacy-endpoints/getComments',
            },
            {
                source: '/api/getDocument',
                destination: '/api/legacy-endpoints/getDocument',
            },
            {
                source: '/api/getDocumentHistory',
                destination: '/api/legacy-endpoints/getDocumentHistory',
            },
            {
                source: '/api/getDocumentPublicationStatus',
                destination: '/api/legacy-endpoints/getDocumentPublicationStatus',
            },
            {
                source: '/api/getModel',
                destination: '/api/legacy-endpoints/getModel',
            },
            {
                source: '/api/listDocuments',
                destination: '/api/legacy-endpoints/listDocuments',
            },
            {
                source: '/api/listModels',
                destination: '/api/legacy-endpoints/listModels',
            },
            {
                source: '/api/putDocument',
                destination: '/api/legacy-endpoints/putDocument',
            },
        ]
    },
}
