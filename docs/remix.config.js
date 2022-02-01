const remixMdxConfigFunction = async filename => {
    const [rehypeSlug, rehypeAutolinkHeadings, remarkSmartypants] = await Promise.all(
        [
            import('rehype-slug').then(mod => mod.default),
            import('rehype-autolink-headings').then(mod => mod.default),
            import('@ngsctt/remark-smartypants').then(mod => mod.default),
        ]
    )

    return {
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        remarkPlugins: [remarkSmartypants],
    }
}

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
    appDirectory: 'app',
    assetsBuildDirectory: 'public/build',
    publicPath: '/build/',
    // todo: sort out w/ proxy on :80
    // publicPath: '/meditor/docs/build/',
    serverBuildDirectory: 'build',
    devServerPort: 8002,
    ignoredRouteFiles: ['.*'],
    mdx: remixMdxConfigFunction,
}
