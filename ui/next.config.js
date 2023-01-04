module.exports = {
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
}
